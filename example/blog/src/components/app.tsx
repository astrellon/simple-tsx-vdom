import { FunctionalComponent, vdom } from "simple-tsx-vdom";
import { State } from "../store";
import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { Posts } from "./posts";

interface Props
{
    readonly state: State;
}

export const App: FunctionalComponent<Props> = (props: Props) =>
{
    return <main>
        <Navbar />
        <Posts posts={props.state.posts} />
        <Footer />
    </main>
}