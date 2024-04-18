import { TaskType } from '../types';

interface RemoteSyncTask {
    getRemoteTasks: () => Promise<[TaskType[], TaskType[]]>;
    updateRemoteTasks: (topTasks: TaskType[], backlogTasks: TaskType[]) => Promise<void>;
}

const useRemoteSyncStorage = (): RemoteSyncTask => {

    const getRemoteTasks = async (): Promise<[TaskType[], TaskType[]]> => {
        let remoteTasks;
        chrome.storage.sync.get(['remoteTopTasks', 'remoteBacklogTasks'], (result: { remoteTopTasks?: any; remoteBacklogTasks?: any }) => {
            console.log(result.remoteTopTasks);
            console.log(result.remoteBacklogTasks);
            const remoteTopTaks = JSON.parse(result.remoteTopTasks);
            const remoteBacklogTasks = JSON.parse(result.remoteBacklogTasks);
            remoteTasks = [...remoteTopTaks, ...remoteBacklogTasks];
        });
        return remoteTasks || [[], []];
    };

    const updateRemoteTasks = async (topTasks: TaskType[], backlogTasks: TaskType[]) => {
        chrome.storage.sync.set({ "remoteTopTasks": JSON.stringify(topTasks, null, 2), "remoteBacklogTasks": JSON.stringify(backlogTasks, null, 2) }).then(() => {
            console.log('Data sync successful');
        });
    };

    return { getRemoteTasks, updateRemoteTasks };
};

export default useRemoteSyncStorage;