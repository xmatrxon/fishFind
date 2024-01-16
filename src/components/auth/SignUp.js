import { auth, db } from "../../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import Select from "react-select";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { collection, getDocs, query, addDoc, where } from "firebase/firestore";

export const SignUp = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const usersCollectionRef = collection(db, "users");
  const [avatarColor, setAvatarColor] = useState("green");
  const [clickedButton, setClickedButton] = useState(false);

  const history = useNavigate();

  const avatarColors = [
    { value: "green", label: "Zielony" },
    { value: "blue", label: "Niebieski" },
    { value: "red", label: "Czerwony" },
  ];

  let existingUser = false;

  const formik = useFormik({
    initialValues: {
      email: "",
      username: "",
      password: "",
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
      avatarColor: Yup.string().required("Kolor awatara jest wymagany"),
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

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formik.values.email,
          formik.values.password,
        );
        await addDoc(usersCollectionRef, {
          UID: userCredential.user.uid,
          username: formik.values.username,
          avatarColor: avatarColor.value,
          role: "user",
        });

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

  const handleAvatarColor = (data) => {
    setAvatarColor(data);
    formik.setFieldValue("avatarColor", data.value);
    formik.setFieldTouched("avatarColor", true);
  };

  return (
    <>
      <div className="flex h-screen w-screen justify-center">
        <div className="w-2/5 self-center">
          <form
            onSubmit={formik.handleSubmit}
            className="mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md">
            <h1 className="border-silver border-b-2 border-solid pb-4">
              Rejestracja
            </h1>
            <div className="mb-4 pt-6">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Email
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
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Wybierz avatar
              </label>
              <Select
                className=""
                options={avatarColors}
                placeholder="Kolor"
                value={avatarColor}
                onChange={handleAvatarColor}
                onBlur={formik.handleBlur}
                isMulti={false}
              />
              {(formik.touched.avatarColor || clickedButton) &&
              formik.errors.avatarColor ? (
                <p className="text-xs italic text-red-500">
                  {formik.errors.avatarColor}
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
    </>
  );
};
