import { todoAppStore, removeTodoItem, TodoItem, moveUpItem, moveDownItem } from "../todoAppStore";
import { ButtonGroup } from "./buttonGroup";
import { PillButton } from "./pillButton";
import { vdom, ClassComponent } from "../../../../src";

interface Props
{
    readonly maxIndex: number;
    readonly index: number;
    readonly item: TodoItem
}

export class TodoItemView extends ClassComponent<Props>
{
    public render()
    {
        const { maxIndex, index, item } = this.props;

        return <div>
            <strong>{item.text}</strong>
            <ButtonGroup>
                <PillButton onclick={this.removeItem} icon='remove' label='Remove' />

                {index > 0 && <PillButton onclick={this.moveUp} icon='up' label='Up' />}
                {index < maxIndex - 1 && <PillButton onclick={this.moveDown} icon='down' label='Down' />}
            </ButtonGroup>
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