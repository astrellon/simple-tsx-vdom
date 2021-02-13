import { vdom, VDomComponent } from "../src";
import { State, todoAppStore, addTodoItem, changeName, setMousePosition, setChecked } from "./todoAppStore";
import { TodoItemList } from "./todoItemList";
import { MouseRenderClass } from './mouseRender';
import { MouseRenderClassState } from './mouseRenderState';
import { Store } from "./store";

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
    readonly checked: boolean;
}
class TestComp extends VDomComponent<Props>
{
    public render()
    {
        return <div>
            <strong>Name: </strong> <input type='checkbox' checked={this.props.checked} onchange={this.onChanged} />
        </div>
    }

    private onChanged = (e: Event) =>
    {
        const checked = (e.target as HTMLInputElement).checked;
        console.log('Changed', checked);
        todoAppStore.execute(setChecked(checked));
    }
}

function onUpdateMouse(x: number, y: number)
{
    todoAppStore.execute(setMousePosition(x, y));
}

export function App(props: {state: State})
{
    const { state } = props;

    return <main>
        <h1>Todo App</h1>
        <p>
            <button onclick={addItem}>Add Item</button>
        </p>
        <div>
            {/* <MouseRenderClass x={state.mouseX} y={state.mouseY} onUpdate={onUpdateMouse} /> */}
        </div>
        <div>
            <MouseRenderClassState />
        </div>
        { state.todoItems.length < 5 &&
        <p>
            <TestComp checked={state.checked} />
            <TestComp checked={state.checked} />
        </p> }
        <p>
            <TodoItemList items={state.todoItems} />
        </p>
        <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><title>Information Circle</title><path d="M248 64C146.39 64 64 146.39 64 248s82.39 184 184 184 184-82.39 184-184S349.61 64 248 64z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M220 220h32v116"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M208 340h88"/><path d="M248 130a26 26 0 1026 26 26 26 0 00-26-26z"/></svg>
        </div>
    </main>;
}