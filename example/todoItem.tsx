import { vdom, VDomComponent } from "../src";
import { todoAppStore, removeTodoItem, TodoItem, moveUpItem, moveDownItem } from "./todoAppStore";

interface Props
{
    readonly maxIndex: number;
    readonly index: number;
    readonly item: TodoItem
}

export class TodoItemView extends VDomComponent<Props>
{
    public render()
    {
        const { maxIndex, index, item } = this.props;

        return <div>
            <strong>{item.text}</strong>
            <button onclick={this.removeItem}>Remove</button>

            {index > 0 && <button onclick={this.moveUp}>Up</button>}
            {index < maxIndex - 1 && <button onclick={this.moveDown}>Down</button>}
        </div>
    }

    private removeItem = () =>
    {
        todoAppStore.execute(removeTodoItem(this.props.item.id));
    }

    private moveUp = () =>
    {
        todoAppStore.execute(moveUpItem(this.props.item.id));
    }

    private moveDown = () =>
    {
        todoAppStore.execute(moveDownItem(this.props.item.id));
    }
}