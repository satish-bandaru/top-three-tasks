import React, { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import { TaskType } from './types';
import { TaskSection } from './constants';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [topTasks, setTopTasks] = useState<TaskType[]>([]);
  const [backlogTasks, setBacklogTasks] = useState<TaskType[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    if (chrome.storage) {
      chrome.storage.local.get(['topTasks', 'backlogTasks'], (result: { topTasks?: TaskType[]; backlogTasks?: TaskType[] }) => {
        setTopTasks(result.topTasks || []);
        setBacklogTasks(result.backlogTasks || []);
      });
    }
  }, []);

  const onToggleCompletion = (taskId: string) => {
    const newTopTasks = topTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task);
    const newBacklogTasks = backlogTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task);

    setTopTasks(newTopTasks);
    setBacklogTasks(newBacklogTasks);

    chrome.storage.local.set({ topTasks: newTopTasks, backlogTasks: newBacklogTasks });
  };

  const onDelete = (taskId: string) => {
    const newTopTasks = topTasks.filter(task => task.id !== taskId);
    const newBacklogTasks = backlogTasks.filter(task => task.id !== taskId);

    setTopTasks(newTopTasks);
    setBacklogTasks(newBacklogTasks);

    chrome.storage.local.set({ topTasks: newTopTasks, backlogTasks: newBacklogTasks });
  };

  const onEditFinished = (taskId: string, newText: string) => {
    const updatedTopTasks = topTasks.map(task =>
      task.id === taskId ? { ...task, text: newText } : task);
    const updatedBacklogTasks = backlogTasks.map(task =>
      task.id === taskId ? { ...task, text: newText } : task);

    setTopTasks(updatedTopTasks);
    setBacklogTasks(updatedBacklogTasks);

    chrome.storage.local.set({ topTasks: updatedTopTasks, backlogTasks: updatedBacklogTasks });
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }

    // Check if trying to add a fourth task to the Top tasks
    if (destination.droppableId === TaskSection.TOP && topTasks.length >= 3 && source.droppableId !== TaskSection.TOP) {
      toast.error("Only three top tasks allowed.");
      return;
    }

    // Determine if the drag is within the same list or between lists
    const sourceTasks = source.droppableId === TaskSection.TOP ? topTasks : backlogTasks;
    const destinationTasks = destination.droppableId === TaskSection.TOP ? topTasks : backlogTasks;

    const [removed] = sourceTasks.splice(source.index, 1);

    // If the drag is within the same list
    if (source.droppableId === destination.droppableId) {
      sourceTasks.splice(destination.index, 0, removed);
    } else {
      // If the drag is between lists
      destinationTasks.splice(destination.index, 0, removed);
    }

    // Update state based on the new order
    if (source.droppableId === TaskSection.TOP) {
      setTopTasks([...sourceTasks]);
      setBacklogTasks([...destinationTasks]);
    } else {
      setTopTasks([...destinationTasks]);
      setBacklogTasks([...sourceTasks]);
    }

    // Persist changes to storage
    chrome.storage.local.set({ topTasks: topTasks, backlogTasks: backlogTasks });
  };

  function generateUUID() {
    let dt = new Date().getTime();
    const uuid = 'xxxx-xxxx-4xxx-yxxx-xxxx-xxxx'.replace(/[xy]/g, function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const newTask: TaskType = {
      id: generateUUID(),
      text: newTaskText,
      completed: false,
      createdDate: new Date().toISOString(),
    };

    const updatedTopTasks = topTasks.length < 3 ? [...topTasks, newTask] : topTasks;
    const updatedBacklogTasks = topTasks.length >= 3 ? [...backlogTasks, newTask] : backlogTasks;

    setTopTasks(updatedTopTasks);
    setBacklogTasks(updatedBacklogTasks);

    setNewTaskText('');

    if (chrome.storage) {
      chrome.storage.local.set({ topTasks: updatedTopTasks, backlogTasks: updatedBacklogTasks });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="container">
        <div className="task-section">
          <h2>Top tasks</h2>
          <TaskList
            tasks={topTasks}
            sectionId={TaskSection.TOP}
            onToggleCompletion={onToggleCompletion}
            onDelete={onDelete}
            onEditFinished={onEditFinished}
          />
        </div>
        <div className="task-section">
          <h2>Backlog</h2>
          <TaskList
            tasks={backlogTasks}
            sectionId={TaskSection.BACKLOG}
            onToggleCompletion={onToggleCompletion}
            onDelete={onDelete}
            onEditFinished={onEditFinished}
          />
        </div>
        <div className="add-task-container">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            className="add-task-input"
            placeholder="Add new task"
          />
          <button onClick={addTask} className="add-task-button">+</button>
        </div>
      </div>
      <ToastContainer position="bottom-center" />
    </DragDropContext>
  );
}

export default App;