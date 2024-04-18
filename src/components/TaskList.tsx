import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons';

import Task from './Task';
import { TaskType } from '../types';
import { TaskSection } from '../constants';

interface TaskListProps {
    tasks: TaskType[];
    sectionId: string;
    onToggleCompletion: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    onEditFinished: (taskId: string, newText: string) => void;
    theme: string;
    isCollapsed?: boolean;
    onToggleCollapsed?: () => void;
    addTask: (newTaskText: string, section: TaskSection) => void;
}

const TaskList: React.FC<TaskListProps> = ({
    tasks,
    sectionId,
    onToggleCompletion,
    onDelete,
    onEditFinished,
    theme,
    isCollapsed = false,
    onToggleCollapsed,
    addTask,
}) => {
    const [newTaskText, setNewTaskText] = useState('');
    const [isInputFocused, setIsInputFocused] = useState(false);

    const handleInputFocus = () => setIsInputFocused(true);
    const handleInputBlur = () => setIsInputFocused(false);

    let sectionHeading = sectionId === TaskSection.FOCUS ? "Focus" : "Defocus";
    const showAddTask = sectionId === TaskSection.FOCUS ? tasks.length < 3 : !isCollapsed;

    return (
        <Droppable droppableId={sectionId}>
            {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                    <div className="task-section-header">
                        <button onClick={onToggleCollapsed} className={`collapse-toggle ${sectionHeading}`}>
                            <FontAwesomeIcon icon={isCollapsed ? faCaretRight : faCaretDown} />
                        </button>
                        <h2 className="h2">{sectionHeading}</h2>
                    </div>
                    <div id={sectionId} className="scrollable-task-list">
                        {!isCollapsed || sectionId !== TaskSection.DEFOCUS ? tasks.map((task, index) => (
                            <Task
                                key={task.id}
                                task={task}
                                index={index}
                                onToggleCompletion={onToggleCompletion}
                                onDelete={onDelete}
                                onEditFinished={onEditFinished}
                                theme={theme}
                            />
                        )) : null}
                    </div>
                    {showAddTask && (
                        <div className={`add-task-container ${isInputFocused ? 'focused' : ''}`}>
                            <input
                                type="text"
                                value={newTaskText}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        addTask(
                                            newTaskText,
                                            sectionId === TaskSection.FOCUS ? TaskSection.FOCUS : TaskSection.DEFOCUS
                                        );
                                        setNewTaskText('');
                                    }
                                }}
                                className={`add-task-input ${sectionId}`}
                                placeholder="Add a task..."
                            />
                        </div>
                    )}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
};

export default TaskList;