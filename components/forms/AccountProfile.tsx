"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserValidation } from "@/lib/validations/user";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { updateUser } from "@/lib/actions/user.actions";
import { usePathname, useRouter } from "next/navigation";
import { uploadImage } from "@/lib/s3client";

interface Props {
  user: {
    id: string;
    objectId: string;
    username: string;
    name: string;
    bio: string;
    image?: string;
  };
  btnTitle: string;
}
const AccountProfile = ({ user, btnTitle }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm({
    resolver: zodResolver(UserValidation),
    defaultValues: {
      profile_photo: user?.image || "",
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",
    },
  });

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void
  ) => {
    e.preventDefault();
    const fileReader = new FileReader();
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!file.type.includes("image")) return;
      fileReader.onload = async (event) => {
        const imageDataUrl = event?.target?.result?.toString() || "";
        fieldChange(imageDataUrl);
      };
      fileReader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof UserValidation>) {
    let location;
    if (selectedFile) {
      location = await uploadImage(selectedFile, values);
    }
    await updateUser({
      userId: user.id,
      name: values.name,
      username: values.username,
      bio: values.bio,
      image: location || values?.profile_photo,
      path: pathname,
    });

    if (pathname === "/profile/edit") {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col justify-start gap-10"
      >
        <FormField
          control={form.control}
          name="profile_photo"
          render={({ field }) => (
            <FormItem className="flex items-center justify-center gap-4">
              <div className="avatar">
                <div className="w-24 rounded-full ring ring-primary-500 ring-offset-base-100 ring-offset-2">
                  <FormLabel className="account-form_image-label">
                    {field.value ? (
                      <Image
                        src={field.value}
                        alt="profile photo"
                        width={96}
                        height={96}
                        priority
                        className="rounded-full object-contain"
                      />
                    ) : (
                      <Image
                        src="/assets/profile.svg"
                        alt="profile photo"
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    )}
                  </FormLabel>
                </div>
              </div>
              <FormControl className="flex-1 text-base-semibold text-gray-200">
                <Input
                  type="file"
                  accept="image/*"
                  placeholder="Upload a photo"
                  className="account-form_image-input"
                  style={{display: "none"}}
                  onChange={(e) => handleImageChange(e, field.onChange)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2">
                Name
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2">
                Username
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2">
                Bio
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={10}
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="bg-primary-500">
          Submit
        </Button>
      </form>
    </Form>
  );
};
export default AccountProfile;
