import { Store, Modifier } from "./store";

// Definition of types for state management.
export interface TodoItem
{
    readonly text: string;
    readonly id: number;
}

export interface State
{
    readonly todoItems: TodoItem[];
    readonly nextItemId: number;
    readonly name: string;
    readonly mouseX: number;
    readonly mouseY: number;
}

const localStorageKey = 'todoApp';
const defaultState: State =
{
    todoItems: [],
    nextItemId: 0,
    name: 'Alan',
    mouseX: 0,
    mouseY: 0
};

let enableLocalStorage = true;
let initialState: State = defaultState;
// The try catch is to handle any exceptions that can occur
// when using localStorage, such as a lack of permissions.
try
{
    // Check if we have any localStorage already.
    if (localStorage[localStorageKey])
    {
        const existingState = JSON.parse(localStorage[localStorageKey]);
        if (existingState != undefined)
        {
            // Combine the default state with the new existing state.
            initialState = {
                ...defaultState,
                ...existingState
            };
        }
    }
}
catch (error)
{
    enableLocalStorage = false;
    console.log('Unable to load from localStorage', error);
}

// Create our state management store
export const todoAppStore = new Store<State>(initialState);

// Save state after each change to localStorage
todoAppStore.subscribe(state =>
{
    try
    {
        if (enableLocalStorage)
        {
            localStorage[localStorageKey] = JSON.stringify(state);
        }
    }
    catch (error)
    {
        console.log('Error updating localStorage', error);
    }
});

// Functions for manipulating the store.
export function addTodoItem(text: string): Modifier<State>
{
    return (state: State) =>
    {
        const id = state.nextItemId + 1;
        return {
            ...state,
            todoItems: [...state.todoItems, { text, id }],
            nextItemId: id
        };
    }
}

export function removeTodoItem(id: number): Modifier<State>
{
    return (state: State) =>
    {
        return {
            ...state,
            todoItems: state.todoItems.filter(item => item.id !== id)
        };
    }
}

export function moveUpItem(id: number): Modifier<State>
{
    return (state: State) =>
    {
        const index = state.todoItems.findIndex(item => item.id === id);
        if (index <= 0)
        {
            return state;
        }

        const todoItems = [...state.todoItems];
        const item = todoItems[index];
        todoItems.splice(index, 1);
        todoItems.splice(index - 1, 0, item);

        return {
            ...state,
            todoItems
        }
    }
}

export function moveDownItem(id: number): Modifier<State>
{
    return (state: State) =>
    {
        const index = state.todoItems.findIndex(item => item.id === id);
        if (index >= state.todoItems.length - 1)
        {
            return state;
        }

        const todoItems = [...state.todoItems];
        const item = todoItems[index];
        todoItems.splice(index, 1);
        todoItems.splice(index + 1, 0, item);

        return {
            ...state,
            todoItems
        }
    }
}

export function changeName(name: string): Modifier<State>
{
    return (state: State) =>
    {
        return {
            ...state,
            name
        }
    }
}

export function setMousePosition(x: number, y: number): Modifier<State>
{
    return (state: State) =>
    {
        return {
            ...state,
            mouseX: x,
            mouseY: y
        }
    }
}