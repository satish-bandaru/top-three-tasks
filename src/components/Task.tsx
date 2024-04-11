import React, { useState, useRef, useEffect } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { TaskType } from '../types';
import '../App.css';

interface TaskProps {
    task: TaskType;
    index: number;
    onToggleCompletion: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    onEditFinished: (taskId: string, newText: string) => void;
}

const Task: React.FC<TaskProps> = ({ task, index, onToggleCompletion, onDelete, onEditFinished }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(task.text);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleEditStart = () => {
        setIsEditing(true);
    };

    const handleEditFinish = () => {
        setIsEditing(false);
        onEditFinished(task.id, editedText);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedText(e.target.value);
    };

    const handleOutsideClick = (e: MouseEvent) => {
        if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
            handleEditFinish();
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`task-item ${task.completed ? 'completed' : ''}`}
                >
                    <span
                        {...provided.dragHandleProps}
                        className="drag-icon"
                    >≡</span>
                    <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onToggleCompletion(task.id)}
                    />
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedText}
                            onChange={handleInputChange}
                            onBlur={handleEditFinish}
                            onKeyDown={(e) => e.key === 'Enter' && handleEditFinish()}
                            ref={inputRef}
                            className="edit-task-input"
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