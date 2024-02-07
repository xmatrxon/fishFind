import { auth, db, storage } from "../../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { collection, getDocs, query, addDoc, where } from "firebase/firestore";
import Footer from "../Footer";
import { v4 } from "uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Tooltip } from "react-tooltip";

export const SignUp = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const usersCollectionRef = collection(db, "users");
  const [clickedButton, setClickedButton] = useState(false);

  const history = useNavigate();

  let existingUser = false;

  const formik = useFormik({
    initialValues: {
      email: "",
      username: "",
      password: "",
      image: null,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Niepoprawny adres email")
        .required("Adres email jest wymagany"),
      username: Yup.string()
        .required("Nazwa użytkownika jest wymagana")
        .min(5, "Minimalna długość nazwy użytkownika to 5 znaków"),
      password: Yup.string()
        .required("Hasło jest wymagane")
        .min(8, "Minimalna długość hasła to 8 znaków"),
      image: Yup.mixed()
        .nullable()
        .test(
          "fileFormat",
          "Obsługiwane formaty plików to JPG, PNG oraz JPEG",
          (value) => {
            if (!value) return true;

            const supportedFormats = ["image/jpeg", "image/png", "image/jpg"];
            return value && value.type
              ? supportedFormats.includes(value.type)
              : true;
          },
        )
        .test(
          "fileSize",
          "Maksymalny dopuszcalny rozmiar zdjecia to 5MB",
          (value) => {
            if (!value) return true;

            const MAX_PHOTO_SIZE = 5242880;
            return value && value.size ? value.size <= MAX_PHOTO_SIZE : true;
          },
        ),
    }),
    onSubmit: async () => {
      try {
        await getUsers();

        if (existingUser) {
          setErrorMessage(
            "Użytkownik o podanej nazwie użytkownika już istnieje",
          );
          return;
        }

        let imageURL = null;

        if (formik.values.image) {
          const imageRef = ref(
            storage,
            `userImages/${formik.values.image.name + v4()}`,
          );
          const snapshot = await uploadBytes(imageRef, formik.values.image);
          imageURL = await getDownloadURL(snapshot.ref);
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formik.values.email,
          formik.values.password,
        );

        if (imageURL) {
          await addDoc(usersCollectionRef, {
            UID: userCredential.user.uid,
            username: formik.values.username,
            role: "user",
            imageURL: imageURL,
            favouriteWater: [],
          });
        } else {
          await addDoc(usersCollectionRef, {
            UID: userCredential.user.uid,
            username: formik.values.username,
            role: "user",
            imageURL:
              "https://firebasestorage.googleapis.com/v0/b/fishfind-2e78f.appspot.com/o/userImages%2FDefaultAvatar.png?alt=media&token=ecb71d3a-2b7e-4ac1-b770-9ce0fbf680f6",
            favouriteWater: [],
          });
        }

        history("/account");
      } catch (err) {
        switch (err.code) {
          case "auth/email-already-in-use":
            setErrorMessage("Podany email znajduje się już w bazie");
            break;
        }
      }
    },
  });

  const getUsers = async () => {
    const q = query(
      collection(db, "users"),
      where("username", "==", formik.values.username),
    );
    const querySnapshot = await getDocs(q);
    const userData = [];
    querySnapshot.forEach((doc) => {
      userData.push({ id: doc.id, data: doc.data() });
    });

    if (userData.length > 0) {
      existingUser = true;
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <>
      <div className="sss flex w-full justify-center text-center">
        <div className="w-2/5 self-center">
          <form
            onSubmit={formik.handleSubmit}
            className="mb-4 rounded bg-[#fafafa] px-8 pb-8 pt-6 shadow-md">
            <h1 className="border-silver border-b-2 border-solid pb-4">
              Rejestracja
            </h1>
            <div className="mb-4 pt-6">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Adres email
              </label>
              <input
                className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                id="email"
                type="text"
                placeholder="Email"
                name="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
              {formik.touched.email && formik.errors.email ? (
                <p className="text-xs italic text-red-500">
                  {formik.errors.email}
                </p>
              ) : null}
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Nazwa użytkownika
              </label>
              <input
                className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                id="username"
                type="text"
                placeholder="Nazwa użytkownika"
                name="username"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.username}
              />
              {formik.touched.username && formik.errors.username ? (
                <p className="text-xs italic text-red-500">
                  {formik.errors.username}
                </p>
              ) : null}
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Hasło
              </label>
              <input
                className="focus:shadow-outline w-full appearance-none rounded border  px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                id="password"
                type="password"
                placeholder="********"
                name="password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
              />
              {formik.touched.password && formik.errors.password ? (
                <p className="text-xs italic text-red-500">
                  {formik.errors.password}
                </p>
              ) : null}
            </div>
            <div className="mb-6">
              <div className="flex justify-center">
                <Tooltip id="my-tooltip" className="z-10" />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-info-circle mr-4 self-center"
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Obługiwane formaty zdjęć to PNG, JPG oraz JPEG. Maksymalny rozmiar zdjęcia to 5MB">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                  <path d="M12 9h.01" />
                  <path d="M11 12h1v4h1" />
                </svg>
                <input
                  type="file"
                  name="image"
                  onChange={(event) =>
                    formik.setFieldValue(
                      "image",
                      event.currentTarget.files.length > 0
                        ? event.currentTarget.files[0]
                        : null,
                    )
                  }
                />
              </div>
              {(formik.touched.image || clickedButton) &&
              formik.errors.image ? (
                <p className="text-xs italic text-red-500">
                  {formik.errors.image}
                </p>
              ) : null}
            </div>
            <div>
              <button
                className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                type="submit"
                onClick={() => setClickedButton(true)}>
                Zarejestruj się
              </button>
            </div>
            {errorMessage ? (
              <div
                className="relative mt-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
                role="alert">
                <span className="block sm:inline">{errorMessage}</span>
                <span className="absolute bottom-0 right-0 top-0 px-4 py-3">
                  <svg
                    className="h-6 w-6 fill-current text-red-500"
                    role="button"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    onClick={() => setErrorMessage("")}>
                    <title>Close</title>
                    <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                  </svg>
                </span>
              </div>
            ) : null}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};
