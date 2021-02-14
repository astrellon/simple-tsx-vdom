import { vdom, VDomComponent } from "../../src";
import { todoAppStore, removeTodoItem, TodoItem, moveUpItem, moveDownItem } from "./todoAppStore";
import PillButton from "./pillButton";
import { ButtonGroup } from "./buttonGroup";

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
            <ButtonGroup>
                <PillButton onClick={this.removeItem} label='Remove' />

                {index > 0 && <PillButton onClick={this.moveUp} label='Up' />}
                {index < maxIndex - 1 && <PillButton onClick={this.moveDown} label='Down' />}
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