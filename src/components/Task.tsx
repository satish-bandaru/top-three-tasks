import React, { ChangeEvent, Component } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { TaskType } from '../types';
import { EditText } from 'react-edit-text';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import '../App.css';

interface TaskProps {
    task: TaskType;
    index: number;
    onToggleCompletion: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    onEditFinished: (taskId: string, newText: string) => void;
    theme: string;
}

interface TaskState {
    editText: string;
}

class Task extends Component<TaskProps, TaskState> {
    constructor(props: TaskProps) {
        super(props);
        this.state = {
            editText: this.props.task.text,
        };
    }

    handleSave = ({ value }: { value: string }) => {
        this.props.onEditFinished(this.props.task.id, value);
        this.setState({ editText: value });
    };

    handleChange = (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        this.setState({ editText: evt.currentTarget.value });
    };

    render() {
        const { task, index, onToggleCompletion, onDelete, theme } = this.props;
        const { editText } = this.state;
        const themeClass = theme === 'light' ? 'light-theme' : 'dark-theme';

        return (
            <Draggable draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`task-item ${task.completed ? 'completed' : ''}`}
                    >
                        <div className={`App ${themeClass}`}>
                            <FontAwesomeIcon icon={faTrash} className="delete-icon" onClick={() => onDelete(task.id)} />
                        </div>
                        <div {...provided.dragHandleProps} className={`App ${themeClass}`}>
                            <FontAwesomeIcon icon={faGripVertical} className="drag-icon" />
                        </div>
                        <input
                            type="checkbox"
                            name={`task-checkbox-${task.id}`}
                            className="checkbox"
                            checked={task.completed}
                            onChange={() => onToggleCompletion(task.id)}
                        />
                        <EditText
                            value={editText}
                            onSave={this.handleSave}
                            onChange={this.handleChange}
                            className='edit-task-input'
                            inputClassName='edit-task-input'
                        />
                    </div>
                )}
            </Draggable>
        );
    }
}

export default Task;