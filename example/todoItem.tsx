import { vdom } from "../src";
import { todoAppStore, removeTodoItem, TodoItem, moveUpItem, moveDownItem } from "./todoAppStore";

function removeItem(id: number)
{
    todoAppStore.execute(removeTodoItem(id));
}

function moveUp(id: number)
{
    todoAppStore.execute(moveUpItem(id));
}

function moveDown(id: number)
{
    todoAppStore.execute(moveDownItem(id));
}

export function TodoItemView(props: { maxIndex: number, index: number, item: TodoItem })
{
    return <div>
        <strong>{props.item.text}</strong>
        <button onclick={() => removeItem(props.item.id)}>Remove</button>
        { props.index > 0 &&
        <button onclick={() => moveUp(props.item.id)}>Up</button> }
        { props.index < props.maxIndex - 1 &&
        <button onclick={() => moveDown(props.item.id)}>Down</button> }
    </div>
}