import { Link } from "react-router-dom";
import logo from "../imgs/sticky-notes-logo-color-2.png";
import { Button } from "@material-tailwind/react";
import {
  HandRaisedIcon,
  UsersIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/solid";

export const LandingPage = () => {
  return (
    <div className="landing-page h-screen w-screen flex flex-col overflow-x-hidden md:px-0 lg:px-12 xl:px-36 bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700">
      <header className="h-fit flex justify-center items-center">
        <img src={logo} className="h-24 max-h-full" alt="sticky notes logo" />
      </header>

      <main className="flex flex-10 justify-between items-center md:flex-col sm:flex-col lg:flex-row">
        <div className="copy w-1/2 p-16">
          <h1 className="text-5xl font-bold text-left text-white leading-tight">
            Упорядочивайте свои заметки с легкостью
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-white">
            Sticky Notes позволяет легко и визуально упорядочивать ваши заметки,
            обеспечивая максимальную гифбкость и полезность. Создавайте группы с
            семьей, друзьями и всеми вашими командами. Вы можете создавать новые
            проекты, чтобы всегда сохранять порядок в своих заметках.
          </p>
          <div className="flex gap-4">
            <Link to="/login">
              <Button
                color="blue"
                size="lg"
                rounded={true}
                ripple="light"
                className="mt-6"
              >
                Вход
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                color="blue"
                size="lg"
                rounded={true}
                ripple="light"
                className="mt-6"
              >
                Регистрация
              </Button>
            </Link>
          </div>
        </div>

        <div className="features w-1/2 p-16 flex justify-center items-center md:space-x-32 md:flex-row sm:flex-col">
          <div className="sm:mt-16 lg:mt-0 flex flex-col justify-center items-center">
            <p className="text-white font-bold">Перетаскивание заметок</p>
            <hr className="mt-2 w-full border-2 border-white"></hr>
            <HandRaisedIcon className="h-16 w-16 text-white mt-4" />
          </div>

          <div className="sm:mt-16 lg:mt-0 flex flex-col justify-center items-center">
            <p className="text-white font-bold">Создание команды</p>
            <hr className="mt-2 w-full border-2 border-white"></hr>
            <UsersIcon className="h-16 w-16 text-white mt-4" />
          </div>

          <div className="sm:mt-16 lg:mt-0 flex flex-col justify-center items-center">
            <p className="text-white font-bold">Организация по проектам</p>
            <hr className="mt-2 w-full border-2 border-white"></hr>
            <ArchiveBoxIcon className="h-16 w-16 text-white mt-4" />
          </div>
        </div>
      </main>

      <footer className="text-center flex flex-1 h-1/6 justify-center items-center font-thin text-gray-500">
        Sticky Notes
      </footer>
    </div>
  );
};
