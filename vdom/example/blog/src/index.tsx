import { vdom, render, VDom } from "../../../src";
import { App } from "./components/app";
import { State } from './store';

const state: State = {
    posts: [
        {
            contents: 'This is the first post',
            id: '1',
            title: 'First Post'
        },
        {
            contents: 'This is the second post',
            id: '2',
            title: 'Second Post'
        }
    ]
}

function renderApp(state: State)
{
    const rootElement = document.getElementById('root');
    render(<App state={state} />, rootElement);
}

// Render the app on start
renderApp(state);
