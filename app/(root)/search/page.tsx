import UserCard from "@/components/cards/UserCard";
import SearchBar from "@/components/shared/SearchBar";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const Page = async ({searchParams}: {searchParams: {q: string}}) => {
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const result = await fetchUsers({
    userId: user.id,
    searchString: searchParams?.q,
    pageNumber: 1,
    pageSize: 25,
    sortBy: 'desc'
  })
  const handleIsFollowing = (id: string) => {
    return userInfo.following.includes(id)
  }
  return (
    <section>
      <h1 className="head-text-mb-10">Search</h1>
      <SearchBar page="search"/>
      <div className="mt-14 flex flex-col gap-9">
        {result.users.length === 0 ? (
            <p className="no-result">No Users</p>
        ):
        <>
            {result.users.map((person:any)=>(
              <UserCard
                key={person.id}
                id={person.id}
                name={person.name}
                username={person.username}
                imageUrl={person.image}
                personType='User'
                currentUser={userInfo._id}
                following={handleIsFollowing(person.id)}
                />
            ))}
        </>
        }
      </div>
    </section>
  );
};

export default Page;
