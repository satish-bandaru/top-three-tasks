import React from 'react';
import { Droppable, DragDropContext, DropResult } from 'react-beautiful-dnd';
import Task from './Task';
import { TaskType } from '../types';

interface TaskListProps {
    tasks: TaskType[];
    sectionId: string;
    onToggleCompletion: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    onEditFinished: (taskId: string, newText: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, sectionId, onToggleCompletion, onDelete, onEditFinished }) => {
    return (
        <Droppable droppableId={sectionId}>
            {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                    {tasks.map((task, index) => (
                        <Task
                            key={task.id}
                            task={task}
                            index={index}
                            onToggleCompletion={onToggleCompletion}
                            onDelete={onDelete}
                            onEditFinished={onEditFinished}
                        />
                    ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
};

export default TaskList;