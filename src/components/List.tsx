import React from "react";

interface Task {
  id?: number;
  name?: string;
  status?: string;
}

type Props = {
  listTask: Task[];
  handleEdit : (id:number) => void
  handleDelete: (id : number) => void
  handleToggleStatus : (id : number) => void
};

export default function ListTask({ listTask,handleDelete, handleEdit, handleToggleStatus }: Props) {

  return (
    <div>
      <div className="tasklist">
        {listTask.map((item) => (
          <div key={item.id} className="taskDetail">
            <div style={{ display: "flex", gap: 12 }}>
              <input onChange={() => handleToggleStatus(Number(item.id))} checked={item.status === "true" ? true : false} type="checkbox" />
              {item.status === "true" ? <s>{item.name}</s> : <p>{item.name}</p>}
             
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <span onClick={() => handleEdit(Number(item.id))}>✏️</span>
              <span onClick={() => handleDelete(Number(item.id))}>🗑️</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}