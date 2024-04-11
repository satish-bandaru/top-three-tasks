import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { TaskType } from '../types';
import '../App.css';

export interface TaskProps {
    task: TaskType;
    index: number;
    onToggleCompletion: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    onEditFinished: (taskId: string, newText: string) => void;
}

const Task: React.FC<TaskProps> = ({ task, index, onToggleCompletion, onDelete, onEditFinished }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(task.text);

    const handleEditStart = () => {
        setIsEditing(true);
    };

    const handleEditFinish = () => {
        setIsEditing(false);
        onEditFinished(task.id, editedText); // Call the callback to save the edited task text
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedText(e.target.value);
    };

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`task-item ${task.completed ? 'completed' : ''}`}
                >
                    <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onToggleCompletion(task.id)}
                    />
                    {isEditing ? ( // Render an input field when editing
                        <input
                            type="text"
                            value={editedText}
                            onChange={handleInputChange}
                            onBlur={handleEditFinish}
                            onKeyDown={(e) => e.key === 'Enter' && handleEditFinish()}
                        />
                    ) : (
                        <span className="task-text" onClick={handleEditStart}>{task.text}</span>
                    )}
                    <span className="delete-icon" onClick={() => onDelete(task.id)}>🗑️</span>
                </div>
            )}
        </Draggable>
    );
};

export default Task;