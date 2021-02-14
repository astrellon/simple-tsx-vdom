import { vdom } from "../../../../src"
import { ButtonGroup } from "./buttonGroup"
import { PillButton } from "./pillButton"

function onClickAdd()
{
    alert('Clicked on add!');
}

function onClickInfo()
{
    alert('Clicked on info!');
}

export const App = () =>
{
    return <main>
        <h1>Title</h1>
        <ButtonGroup>
            <PillButton icon='add' label='Add' onclick={onClickAdd} />
            <PillButton icon='info' label='Info' onclick={onClickInfo} />
        </ButtonGroup>
    </main>
}