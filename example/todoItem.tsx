import { vdom } from "../src";
import { todoAppStore, removeTodoItem, TodoItem } from "./todoAppStore";

function removeItem(id: number)
{
    todoAppStore.execute(removeTodoItem(id));
}

export function TodoItemView(props: { item: TodoItem })
{
    return <div>
        <strong>{props.item.text}</strong>
        <button onclick={() => removeItem(props.item.id)}>Remove</button>
    </div>
}