import { todoAppStore, removeTodoItem, TodoItem, moveUpItem, moveDownItem } from "../todoAppStore";
import { ButtonGroup } from "./buttonGroup";
import { PillButton } from "./pillButton";
import { vdom, ClassComponent, FinishUnmountHandler } from "../../../../src";
import './todoItem.scss';

interface Props
{
    readonly maxIndex: number;
    readonly index: number;
    readonly item: TodoItem
}

export class TodoItemView extends ClassComponent<Props>
{
    public onMount()
    {
        const domNode = this.rootDomNode();
        if (!domNode)
        {
            return;
        }

        setTimeout(() =>
        {
            (domNode as HTMLElement).classList.add('mounted');
        }, 0);
    }

    public onUnmount(finishedUnmounting: FinishUnmountHandler)
    {
        const domNode = this.rootDomNode();
        if (!domNode)
        {
            finishedUnmounting();
            return;
        }

        (domNode as HTMLElement).classList.remove('mounted');
        setTimeout(() =>
        {
            finishedUnmounting();
        }, 300);
    }

    public render()
    {
        const { maxIndex, index, item } = this.props;

        return <div class='todo-item'>
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