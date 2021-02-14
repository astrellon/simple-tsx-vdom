import { vdom } from "../../src";
import { TodoItem } from "./todoAppStore";
import { TodoItemView } from "./todoItem";

export function TodoItemList(props: { items: TodoItem[] })
{
    const { items } = props;

    if (items.length === 0)
    {
        return <strong>No items</strong>;
    }

    // Note! Our vdom does not support returning a list of nodes to create.
    return <div>
        <div>
            Items: {items.length}
        </div>
        <div>
        { items.map((item, index) => <TodoItemView key={item.id.toString()} maxIndex={items.length} index={index} item={item} />) }
        </div>
    </div>;
}
