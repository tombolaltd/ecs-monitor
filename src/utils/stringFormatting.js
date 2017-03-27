export function formatTaskDefinitionString(taskDefinition) {
    let lastIndexOfSlash = taskDefinition.lastIndexOf('/');
    return taskDefinition.substring(lastIndexOfSlash + 1);
}