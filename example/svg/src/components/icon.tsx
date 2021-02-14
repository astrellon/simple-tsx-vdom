import { vdom, FunctionalComponent } from "../../../../src";
import './icon.scss';

export type IconType = 'info' | 'add';
interface Props
{
    readonly type: IconType;
}

const infoIcon = <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 512 512">
        <path d="M248 64C146.39 64 64 146.39 64 248s82.39 184 184 184 184-82.39 184-184S349.61 64 248 64z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" />
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M220 220h32v116" />
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M208 340h88" /><path d="M248 130a26 26 0 1026 26 26 26 0 00-26-26z" />
    </svg>;

const addIcon = <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 512 512">
        <path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/>
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M256 176v160M336 256H176"/>
    </svg>

export const Icon: FunctionalComponent = (props: Props) =>
{
    switch (props.type)
    {
        case 'info': return infoIcon;
        case 'add': return addIcon;
        default: <span>Unknown icon type{props.type}</span>;
    }
}