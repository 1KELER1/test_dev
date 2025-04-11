import { Card, Input, Button, Typography } from "@material-tailwind/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/endpoints/users";
export const Login = () => {
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const navigate = useNavigate();
  const onFinish = async (e) => {
    e.preventDefault();
    const credentials = {
      username: username,
      password: password,
    };
    try {
      const status = await login(credentials);
      if (status === 200) {
        navigate("/dashboard");
      }
    } catch (error) {
      setIsValid(false);
      console.error(error);
    }
  };
  return (
    <Card color="transparent" shadow={false}>
      <Typography variant="h2" color="blue-gray">
        С возращением!
      </Typography>
      <Typography color="gray" className="mt-1 font-normal">
        Пожалуйста, предоставьте свою информацию
      </Typography>
      <form
        className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96"
        onSubmit={onFinish}
      >
        <div className="mb-4 flex flex-col gap-6">
          <Input
            size="lg"
            label="логин"
            color="blue"
            onChange={(e) => {
              setUsername(e.target.value);
              setIsValid(true);
            }}
            error={!isValid}
          />
          <Input
            type="password"
            size="lg"
            label="Пароль"
            color="blue"
            onChange={(e) => {
              setPassword(e.target.value);
              setIsValid(true);
            }}
            error={!isValid}
          />
          {!isValid && (
            <Typography color="red" className="mt-2 text-center font-normal">
              Пожалуйста, введите действительные имя пользователя и пароль!
            </Typography>
          )}
        </div>
        <Button className="mt-6 bg-blue-300" type="submit" fullWidth>
          Вход
        </Button>
        <Typography color="gray" className="mt-4 text-center font-normal">
          Новичок вstickyNotes ?{" "}
          <Link to="/signup">
            <span
              href="#"
              className="font-medium text-blue-200 transition-colors hover:text-blue-700"
            >
              Регистрация
            </span>
          </Link>
        </Typography>
      </form>
    </Card>
  );
};
