import { Link, useHistory, useLocation } from 'react-router-dom';
import ButtonIcon from 'components/ButtonIcon';
import { useForm } from 'react-hook-form';
import { requestBackendLogin} from 'util/requests';
import { useContext, useState } from 'react';
import { AuthContext } from 'AuthContext';
import './styles.css';
import { saveAuthData } from 'util/storage';
import { getTokenData } from 'util/token';

type CredentialsDTO = {
  username: string;
  password: string;
}

type LocationState = {
  from: string;
}

const Login = () => {
  const location = useLocation<LocationState>();
  const {from} = location.state || {from : { pathname: '/admin'}};

  const {setAuthContextData} = useContext(AuthContext);
  const [hasError, setHasError] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialsDTO>();

  const history = useHistory();

  const onSubmit = (formData: CredentialsDTO) => {
    requestBackendLogin(formData)
      .then((response) => {
        saveAuthData(response.data); //salva os dados no locaStorage
        setHasError(false);  // fala que não teve erro no login
        setAuthContextData({ // Atualiza para Logout/Login na tela do usuario 
          authenticated: true,
          tokenData: getTokenData()
        })
        history.replace(from) //redireciona para tela de admin
      })
      .catch((error) => {
        setHasError(true);
        console.log('Erro', error);
      });
  };
  return (
    <div className="base-card login-card">
      <h1>LOGIN</h1>
      {hasError && <div className="alert alert-danger">Erro no Login</div>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <input
            {...register('username', {
              required: 'Campo obrigatório',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email inválido',
              },
            })}
            type="text"
        className={`form-control base-input ${errors.username ? 'is-invalid' : ''}`} //mostra o campo vermelho
            placeholder="Email"
            name="username"
          />
          <div className="invalid-feedback d-block">
            {errors.username?.message}
          </div>
        </div>
        <div className="mb-2">
          <input
            {...register('password', {
              required: 'Campo obrigatório',
            })}
            type="password"
            className={`form-control base-input ${errors.password ? 'is-invalid' : ''}`} //mostra o campo vermelho
            placeholder="Password"
            name="password"
          />
        </div>
        <div className="invalid-feedback d-block">
          {errors.password?.message}
        </div>
        <Link to="/admin/auth/recover" className="login-link-recover">
          Esqueci a senha
        </Link>
        <div className="login-submit">
          <ButtonIcon text="Fazer login" />
        </div>
        <div className="signup-container">
          <span className="not-registered">Não tem Cadastro?</span>
          <Link to="/admin/auth/register" className="login-link-register">
            CADASTRAR
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
