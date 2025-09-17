import React, { useEffect, useState } from "react";
import ListTask from "./List";
import axios from "axios";
import { Button, Form, Input, Modal, Spin, type FormProps } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";

interface Task {
  id?: number;
  name: string;
  status: string;
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isOpenModel, setIsOpenModel] = useState<boolean>(false);
  const [targetDelete, setTargetDelete] = useState<Task | undefined>(undefined);
  const [inputNewTask, setInputNewTask] = useState<string>("");
  const [errorInput, setErrorInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [targetEdit, setTargetEdit] = useState<Task | undefined>(undefined);
  const [isOpenModelEdit, setIsOpenModelEdit] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [statusTask, setStatusTask] = useState<string>("");
  const loadTasks = async () => {
    try {
      const query = statusTask == "true" ? "status=true" : statusTask === "false" ? "status=false" : ""; 
      const response = await axios.get(
        `http://localhost:8080/tasks${query ? `?${query}` : ""}`
      );
      setTasks(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setErrorInput("");
    setLoading(true);
    const timeOut = setTimeout(() => {
      loadTasks();
      setLoading(false);
      clearTimeout(timeOut);
    }, 500);
  }, [statusTask]);

  const handleDeleteTask = async (id: number) => {
    setIsOpenModel(true);
    const targetTaskDel = tasks.find((task) => task.id === id);
    if (targetTaskDel) {
      setTargetDelete(targetTaskDel);
    }
  };
  const handleOk = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/tasks/${targetDelete?.id}`
      );

      if (response.status === 200) {
        // Hiển thị thông báo
        alert("Xóa thành công");
        setIsOpenModel(false);

        // Load lại dữ liệu
        loadTasks();
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const handleCancel = () => {
    setIsOpenModel(false);
  };
  const handleEditTask = (id: number) => {
    setIsOpenModelEdit(true);
    const target = tasks.find((task) => task.id === id);
    if (target) {
      setTargetEdit(target);
      console.log(target);
      form.setFieldsValue(target);
    }
  };

  const handleInputTask = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorInput("");
    setInputNewTask(e.target.value);
  };

  const handleAddTask = () => {
    if (inputNewTask) {
      setErrorInput("");
      const newTask: Task = {
        name: inputNewTask,
        status: "false",
      };
      axios
        .post("http://localhost:8080/tasks", newTask)
        .then(() => {
          console.log("Thêm mới nhiệm vụ thành công");
          loadTasks();
          setInputNewTask("");
        })
        .catch(() => {
          console.log("Thêm mới chưa thành công");
        })
        .finally(() => {
          console.log();
        });
    } else {
      setErrorInput("Tên nhiệm vụ không được để trống");
    }
  };

  const handleToggleStatus = (id: number) => {
    const targetToggle = tasks.find((task) => task.id === id);
    if (targetToggle) {
      axios
        .put(`http://localhost:8080/tasks/${id}`, {
          ...targetToggle,
          status: targetToggle.status === "true" ? "false" : "true",
        })
        .then(() => {
          console.log("Cập nhật trạng thái thành công");
          loadTasks();
        })
        .catch(() => {
          console.log("Cập nhật trạng thái chưa thành công");
        });
    }
  };

  const onFinish: FormProps<Task>["onFinish"] = (values) => {
    console.log("Success:", values);
    try {
      axios
        .put(`http://localhost:8080/tasks/${targetEdit?.id}`, {
          ...targetEdit,
          ...values,
        })
        .then(() => {
          console.log("Cập nhật thông tin thành công");
          setIsOpenModelEdit(false);
          loadTasks();
          setTargetEdit(undefined);
        })
        .catch(() => {
          console.log("Cập nhật thông tin chưa thành công");
        });
    } catch (error) {
      console.log(error);
    }
  };
  const handleCancelEdit = () => {
    setIsOpenModelEdit(false);
  };

  const onFinishFailed: FormProps<Task>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
    handleCancelEdit();
  };

  return (
    <>
      {loading ? (
        <>
          <div>
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "#000",
                opacity:0.3,
              }}
              className="overlay"
            ></div>
            <Spin
              style={{
                color: "white",
                position: "fixed",
                top: "45%",
                left: "50%",
              }}
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            />
          </div>
        </>
      ) : (
        <></>
      )}

      <div className="task-manager">
        <h2>Quản lý công việc</h2>
        <div className="inputAddTask">
          <input
            value={inputNewTask}
            style={{ borderColor: errorInput === "" ? "#dedede" : "red" }}
            onChange={handleInputTask}
            placeholder="Nhập tên công việc"
            type="text"
          />
          {errorInput === "" ? (
            <></>
          ) : (
            <div style={{ color: "red", fontSize: "10px" }}>{errorInput}</div>
          )}
          <button onClick={handleAddTask} className="btn-active">
            Thêm công việc
          </button>
        </div>
        <div className="btn-filter">
          <button
            onClick={() => setStatusTask("")}
            className={statusTask === "" ? "btn-active" : ""}
          >
            Tất cả
          </button>
          <button
            onClick={() => setStatusTask("true")}
            className={statusTask === "true" ? "btn-active" : ""}
          >
            Hoàn thành
          </button>
          <button
            onClick={() => setStatusTask("false")}
            className={statusTask === "false" ? "btn-active" : ""}
          >
            Đang thực hiện
          </button>
        </div>
        <ListTask
          listTask={tasks}
          handleDelete={handleDeleteTask}
          handleEdit={handleEditTask}
          handleToggleStatus={handleToggleStatus}
        />
        <div className="delete-action">
          <button style={{ backgroundColor: "#FF4D4F", color: "#fff" }}>
            Xóa công việc hoàn thành
          </button>
          <button style={{ backgroundColor: "#FF4D4F", color: "#fff" }}>
            Xóa tất cả công việc
          </button>
        </div>
      </div>

      <>
        <Modal
          title="Xác nhận"
          open={isOpenModel}
          closable={true}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <p>{`Bạn chắc chắn xóa nhiệm vụ <${targetDelete?.name}>`}</p>
        </Modal>
      </>
      <div>
        <>
          <Modal
            title="Cập nhật thông tin"
            closable={true}
            open={isOpenModelEdit}
            onCancel={handleCancelEdit}
            footer={false}
          >
            <Form
              form={form}
              name="basic"
              style={{ maxWidth: "100%" }}
              initialValues={targetEdit}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Form.Item<Task> name="name">
                <Input />
              </Form.Item>

              <Form.Item label={null}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 10,
                    justifyContent: "flex-end",
                  }}
                >
                  <Button type="primary" htmlType="submit">
                    Cập nhật
                  </Button>
                  <Button
                    type="default"
                    htmlType="button"
                    onClick={handleCancelEdit}
                  >
                    Hủy
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Modal>
        </>
      </div>
    </>
  );
}