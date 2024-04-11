import React from 'react';
import { Droppable, DragDropContext, DropResult } from 'react-beautiful-dnd';
import Task, { TaskProps } from './Task';
import { TaskType } from '../types';

interface TaskListProps {
    tasks: TaskType[];
    sectionId: string;
    onToggleCompletion: (taskId: string) => void;
    onDelete: (taskId: string) => void;
}

interface TaskListProps {
    tasks: TaskType[];
    sectionId: string;
    onToggleCompletion: (taskId: string) => void;
    onDelete: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, sectionId, onToggleCompletion, onDelete }) => {
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
                        />
                    ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
};

export default TaskList;