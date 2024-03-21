"use client";
import { fetchThreads } from "@/lib/actions/thread.actions";
import { User } from "@clerk/nextjs/server";
import React, { useEffect, useState } from "react";
import ThreadCard from "../cards/ThreadCard";
import InfiniteScroll from "react-infinite-scroll-component";
import SingleLineThreadCreate from "../forms/SingleLineThreadCreate";
import { getBookmarked } from "@/lib/actions/user.actions";
interface Params {
  user: User | null;
  userInfo: any;
}
const RenderThreadsSection = ({ user, userInfo }: Params) => {
  const [threads, setThreads] = useState<Params[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [skip, setSkip] = useState(0);
  const [created, setCreated] = useState(0);
  const update = () => {
    setCreated((created) => created + 1);
    setSkip(0);
    setThreads([]);
    setHasMore(true);
  };

  const hasLikedThread = (threadLikes: string[]) => {
      return user && threadLikes.includes(user?.id);
  };

  const isBookmarked = (threadId: string) => {
    return user && bookmarks.includes(threadId);
  }

  useEffect(()=>{
    (async()=>{
      const bookmarks = await getBookmarked(userInfo?._id)
      const filter = bookmarks.map((ele: any)=>ele._id)
      setBookmarks(filter);
    })()
  },[bookmarks])
  
  useEffect(() => {
    let didFetchNewThreads = false;
    (async () => {
      try {
        const { threads } = await fetchThreads(skip, 4);
        if (threads.length === 0) {
          setHasMore(false);
          return;
        }
        setThreads((prevItems) => [...prevItems, ...threads]);
        didFetchNewThreads = true;
      } catch (err) {
        console.error(err);
      }
    })();

    if (didFetchNewThreads) {
      setSkip((prevSkip) => prevSkip + 4);
    }
  }, [skip, created]);

  return (
    <>
      {threads?.length === 0 ? (
        <p className="no-result">No threads found</p>
      ) : (
        <>
          <SingleLineThreadCreate
            userId={userInfo?._id}
            user={JSON.parse(JSON.stringify(user))}
            userInfo={userInfo}
            update={update}
          />
          <InfiniteScroll
            dataLength={threads.length}
            next={() => setSkip((prevSkip) => prevSkip + 4)}
            hasMore={hasMore}
            loader={
              <h4 className="text-gray-1 text-center mt-2">Loading...</h4>
            }
            scrollThreshold={0.9}
            endMessage={
              <p className="text-gray-1 text-center mt-2">
                <b>Yay! You have seen it all</b>
              </p>
            }
          >
            {threads?.map((thread: any, index) => (
              <section className={`${index != 0 && "mt-[1rem]"} flex flex-col`}>
                <ThreadCard
                  key={thread?._id}
                  id={thread?._id}
                  currentUserId={user?.id || ""}
                  parentId={thread?.parentId}
                  content={thread?.text}
                  author={thread?.author}
                  community={thread?.community}
                  createdAt={thread?.createdAt}
                  comments={thread?.children}
                  liked={hasLikedThread(thread?.likes)}
                  likes={thread?.likes?.length}
                  media={thread?.media}
                  firstLiked={thread?.likes[0]}
                  likesArray={thread?.likes}
                  bookmarked={isBookmarked(thread?._id)}
                  update={update}
                />
              </section>
            ))}
          </InfiniteScroll>
        </>
      )}
    </>
  );
};

export default RenderThreadsSection;
