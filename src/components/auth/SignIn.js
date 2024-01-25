import { auth } from "../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import Footer from "../Footer";

export const SignIn = () => {
  const [errorMessage, setErrorMessage] = useState("");

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Niepoprawny adres email")
        .required("Adres email jest wymagany"),
      password: Yup.string()
        .required("Hasło jest wymagane")
        .min(8, "Minimalna długość hasła to 8 znaków"),
    }),
    onSubmit: async () => {
      try {
        await signInWithEmailAndPassword(
          auth,
          formik.values.email,
          formik.values.password,
        );
      } catch (err) {
        switch (err.code) {
          case "auth/invalid-login-credentials":
            setErrorMessage("Nieprawidłowe dane logowania");
            break;
        }
      }
    },
  });

  return (
    <>
      <div className="flex h-screen w-full justify-center">
        <div className="w-2/5 self-center">
          <form
            onSubmit={formik.handleSubmit}
            className="mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md">
            <h1 className="border-silver border-b-2 border-solid pb-4">
              Logowanie
            </h1>
            <div className="mb-4 pt-6">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Email
              </label>
              <input
                className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                id="username"
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
            <div className="mb-3">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Hasło
              </label>
              <input
                className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
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
            <div className="mb-4">
              <Link
                to="/reset"
                className="resetPinline-block hover:text-blue-800assword align-baseline text-sm font-bold text-blue-500">
                Zapomnialeś hasła?
              </Link>
            </div>
            <div>
              <button
                className="focus:shadow-outline mb-6 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                type="submit">
                Zaloguj
              </button>
            </div>
            <div>
              <p className="">
                Nie masz konta?{" "}
                <Link to="/signup" className="text-blue-500">
                  Zarejestruj się
                </Link>
              </p>
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
