import { vdom, FunctionalComponent } from "../../../../src";
import { State, todoAppStore, addTodoItem } from "../todoAppStore";
import { TodoItemList } from "./todoItemList";
import { PillButton } from "./pillButton";

function addItem()
{
    const newItemText = prompt('New item text:');
    if (newItemText)
    {
        todoAppStore.execute(addTodoItem(newItemText));
    }
}

interface Props
{
    readonly state: State;
}

export const App: FunctionalComponent<Props> = (props: Props) =>
{
    const { state } = props;

    return <main>
        <h1>Todo App</h1>
        <p>
            <PillButton onclick={addItem} icon='add' label='Add Item' />
        </p>
        <p>
            <TodoItemList items={state.todoItems} />
        </p>
    </main>;
}