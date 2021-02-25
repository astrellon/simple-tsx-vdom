import { FunctionalComponent, vdom } from "simple-tsx-vdom";
import { PostState } from "../store";
import { Post } from "./post";

interface Props
{
    readonly posts: PostState[];
}

export const Posts: FunctionalComponent<Props> = (props: Props) =>
{
    return <div>
        {props.posts.map(post => <Post key={post.id} post={post} />)};
    </div>
}