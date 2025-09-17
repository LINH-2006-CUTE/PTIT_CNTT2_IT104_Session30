import React, { useEffect, useState } from "react";
import { Button, Input, List, Spin, Checkbox, Modal, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [newTodo, setNewTodo] = useState<string>("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editText, setEditText] = useState<string>("");

  const API_URL = "http://localhost:3000/todos";

  //danh sách công việc
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setTodos(res.data);
    } catch (err) {
      message.error("Không tải dc dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Thêm công việc
  const addTodo = async () => {
    if (!newTodo.trim()) {
      message.error("Tên công việc không được để trống!");
      return;
    }
    try {
      const res = await axios.post(API_URL, {
        title: newTodo,
        completed: false,
      });
      setTodos([...todos, res.data]);
      setNewTodo("");
    } catch {
      message.error("Không thêm được công việc");
    }
  };

  // Xóa công việc
  const deleteTodo = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch {
      message.error("Không xóa được công việc");
    }
  };

  // trạng thái công việc
  const toggleTodo = async (todo: Todo) => {
    try {
      const updated = { ...todo, completed: !todo.completed };
      await axios.put(`${API_URL}/${todo.id}`, updated);
      setTodos(todos.map((t) => (t.id === todo.id ? updated : t)));
    } catch {
      message.error("Lỗi !");
    }
  };

  // Sửa công việc
  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setEditText(todo.title);
  };

  const saveEdit = async () => {
    if (!editingTodo) return;
    try {
      const updated = { ...editingTodo, title: editText };
      await axios.put(`${API_URL}/${editingTodo.id}`, updated);
      setTodos(todos.map((t) => (t.id === editingTodo.id ? updated : t)));
      setEditingTodo(null);
    } catch {
      message.error("Lỗi ");
    }
  };

  return (
    <div style={{ width: "500px", margin: "20px", padding: 20,borderRadius: 8 }}>
      {/* Title */}
      <h2 style={{ textAlign: "center" }}>Quản lý công việc</h2>

      {/* Input thêm công việc */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <Input
          placeholder="Nhập công việc..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <Button type="primary" onClick={addTodo}>
          Thêm
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <Spin tip="Đang tải dữ liệu..." />
      ) : (
        <List
          bordered
          dataSource={todos}
          renderItem={(todo) => (
            <List.Item
              actions={[
                <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(todo)} />,
                <Button type="link" danger icon={<DeleteOutlined />} onClick={() => deleteTodo(todo.id)} />,
              ]}
            >
              <Checkbox
                checked={todo.completed}
                onChange={() => toggleTodo(todo)}
              >
                {todo.completed ? <del>{todo.title}</del> : todo.title}
              </Checkbox>
            </List.Item>
          )}
        />
      )}

      {/* Modal sửa công việc */}
      <Modal
        open={!!editingTodo}
        onCancel={() => setEditingTodo(null)}
        onOk={saveEdit}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Input value={editText} onChange={(e) => setEditText(e.target.value)} />
      </Modal>
    </div>
  );
}
