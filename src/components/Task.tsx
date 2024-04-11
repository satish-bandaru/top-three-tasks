import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { TaskType } from '../types';
import '../App.css';

export interface TaskProps {
    task: TaskType;
    index: number;
    onToggleCompletion: (taskId: string) => void;
    onDelete: (taskId: string) => void;
}

const Task: React.FC<TaskProps> = ({ task, index, onToggleCompletion, onDelete }) => {
    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                        ...provided.draggableProps.style,
                        opacity: snapshot.isDragging ? 0.5 : 1,
                    }}
                    className={`task-item ${task.completed ? 'completed' : ''}`}
                >
                    <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onToggleCompletion(task.id)}
                    />
                    <span className="task-text">{task.text}</span>
                    <i className="fas fa-trash delete-icon" onClick={() => onDelete(task.id)}></i>
                </div>
            )}
        </Draggable>
    );
};

export default Task;