import Header from "../../components/Header";
import { sanityClient, urlFor } from "../../sanity";
import { Post } from "../../typings";
import { GetStaticProps } from "next";
import PortableText from "react-portable-text";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";

interface Props {
  post: Post;
}
interface IFormInput {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

function Post({ post }: Props) {
  console.log(post);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    await fetch("/api/createComment", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then(() => {
        console.log(data);
        setSubmitted(true);
      })
      .catch((err) => {
        console.log(err);
        setSubmitted(false);
      });
  };

  return (
    <main>
      <Header />
      <img
        className="w-full h-40 object-cover"
        src={urlFor(post.mainImage).url()!}
        alt=""
      />
      <article className="max-w-7xl mx-auto p-10">
        <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
        <h2 className="text-xl font-light text-gray-500 mb-2">
          {post.description}
        </h2>
        <div className="flex items-center space-x-2">
          <img
            className="h-10 w-10 rounded-full"
            src={urlFor(post.author.image).url()!}
            alt="photo of author"
          />
          <p className="font-extralight text-sm">
            Blog Post by{" "}
            <span className="text-green-600">{post.author.name}</span> -
            Pulished at{" "}
            {new Date(post._createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </p>
        </div>
        <div className="mt-10">
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="text-2xl font-bold my-5" {...props} />
              ),
              h2: (props: any) => (
                <h1 className="text-xl font-bold my-5" {...props} />
              ),
              li: ({ children }: any) => (
                <li className="ml-4 list-disc">{children}</li>
              ),
              link: ({ href, children }: any) => (
                <a className="text-blue-500 hover:underline">{children}</a>
              ),
            }}
          />
        </div>
      </article>
      <hr className="max-w-lg my-5 mx-auto border border-yellow-500" />
      {submitted ? (
        <div className="flex flex-col items-center p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold">
            Thank you for submitting your comment!
          </h3>
          <p>Once it has been approved, it will appear below</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col p-5 my-10 max-w-2xl mx-auto mb-10"
        >
          <h3 className="text-sm text-yellow-500">Enjoyed this article?</h3>
          <h4 className="text-3xl font-bold">Leave a comment below!</h4>
          <hr className="py-3 mt-2" />
          <input
            {...register("_id")}
            type="hidden"
            name="_id"
            value={post._id}
          />
          <label className="block mb-5">
            <span className="text-gray-700">
              Name
              <input
                {...register("name", { required: true })}
                className="shadow border-rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring"
                type="text"
                placeholder="Name"
              />
            </span>
          </label>
          <label className="block mb-5">
            <span className="text-gray-700">
              Email
              <input
                {...register("email", { required: true })}
                className="shadow border-rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring"
                type="email"
                placeholder="Email"
              />
            </span>
          </label>
          <label className="block mb-5">
            <span className="text-gray-700">
              Comment
              <textarea
                {...register("comment", { required: true })}
                className="shadow border-rounded py-2 px-3 form-textarea mt-1 block w-full ring-yellow-500 outline-none focus:ring"
                rows={8}
                placeholder="Comment"
              />
            </span>
          </label>
          {/* errors will return when field validation fails */}
          <div className="flex flex-col p-5">
            {errors.name && (
              <span className="text-red-500">
                {" "}
                - The "Name" field is required
              </span>
            )}
            {errors.comment && (
              <span className="text-red-500">
                {" "}
                - The "Email" field is required
              </span>
            )}
            {errors.email && (
              <span className="text-red-500">
                {" "}
                - The "Email" field is required
              </span>
            )}
          </div>
          <input
            type="submit"
            className="shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer"
          />
        </form>
      )}

      {/* Comments */}
      <div className="flex flex-col p-10 my-10 max-w-2xl mx-auto shadow-yellow-500 shadow space-y-2">
        <h3 className="text-4xl">Comments</h3>
        <hr className="pb-2" />
        {post.comment.map((each) => (
          <div key={each._id}>
            <p>
              <span className="text-yellow-500">{each.name}:</span>{" "}
              {each.comment}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Post;

export const getStaticPaths = async () => {
  const query = `*[_type =="post"]{
  _id,
  slug {
  current
}
}`;
  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type =="post" && slug.current == $slug][0]{
  _id,
  _createdAt,
  title,
  author ->{
  name,
  image
},
'comment':*[
    _type == "comment" &&
    post._ref == ^._id &&
    approved == true],
description,
mainImage,
slug,
body
}`;

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  });

  if (!post || post.length < 1) {
    return {
      notFound: true, // if param is invalid redirect to 404
    };
  }
  return {
    props: {
      post,
    },
    revalidate: 60, //after 60 sections it will update the old cached version
  };
};
