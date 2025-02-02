import { AxiosRequestConfig } from 'axios';
import { useEffect } from 'react';
import Select from 'react-select';
import { useForm, Controller } from 'react-hook-form';
import { useHistory, useParams } from 'react-router-dom';
import CurrencyInput from 'react-currency-input-field';
import { Product } from 'types/product';
import { requestBackend } from 'util/requests';
import './styles.css';
import { useState } from 'react';
import { Category } from 'types/category';
import { toast } from 'react-toastify';

type UrlParams = {
  // tipo criado, pode ser mais d um em uma rota url
  productId: string;
};

const Form = () => {
  const history = useHistory();

  const { productId } = useParams<UrlParams>(); //pega o parametro da url
  const isEditing = productId !== 'create'; //se parametro da url for diferente do create
  const [selectCategories, setSelectCategories] = useState<Category[]>([]); // armazena o estado do componente das categorias

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue, //permite definir o valor de algum atributo
    control, // objeto de controle do hook form
  } = useForm<Product>();

  useEffect(() => {
    //função pra carrega do backend quando o componente for montado
    requestBackend({ url: '/categories' }).then((response) => {
      setSelectCategories(response.data.content); //Atribui o dados da resposta do backend no setSelectCategories
    });
  }, []);

  useEffect(() => {
    // função pra carrega os dados do produto no formulário de editar
    if (isEditing) {
      //se estiver na rota de editar
      requestBackend({ url: `/products/${productId}` }).then((response) => {
        //carrega o produto do id pego na rota url
        const product = response.data as Product; //atribui os dados carregados do tipo Product na const
        setValue('name', product.name); //coloca os valores no formulario
        setValue('price', product.price);
        setValue('description', product.description);
        setValue('imgUrl', product.imgUrl);
        setValue('categories', product.categories);
      });
    }
  }, [isEditing, productId, setValue]); //caso mudar o valor de algum, a função atualiza os dados

  const onSubmit = (formData: Product) => {
    const data = {
      ...formData,
      price: String(formData.price).replace(',', '.'),
    };

    const config: AxiosRequestConfig = {
      method: isEditing ? 'PUT' : 'POST', // se estiver editando, metodo 'PUT' senão 'POST'
      url: isEditing ? `/products/${productId}` : `/products`, // se estiver editando, metodo 'PUT' senão 'POST'
      data: data, //atribui os dados passados na variavel data
      withCredentials: true, //passa token no header da requisição
    };

    requestBackend(config)
      .then((response) => {
        toast.info('Produto cadastrado com sucesso!');
        console.log(response.data); //imprime os dados
        history.push('/admin/products');
      })
      .catch(() => {
        toast.error('Erro ao cadastrar o produto!');
      });
  };

  const handleCancel = () => {
    history.push('/admin/products'); //volta para a listagem
  };

  return (
    <div className="product-crud-container">
      <div className="base-card product-crud-form-card">
        <h1 className="product-crud-form-title">DADOS DO PRODUTO</h1>

        <form onSubmit={handleSubmit(onSubmit)} data-testid="form">
          <div className="row product-crud-inputs-container">
            <div className="col-lg-6 product-crud-inputs-left-container">
              <div className="margin-bottom-30">
                <input
                  {...register('name', {
                    required: 'Campo obrigatório',
                  })}
                  type="text"
                  className={`form-control base-input ${
                    errors.name ? 'is-invalid' : ''
                  }`} //mostra o campo vermelho
                  placeholder="Nome do produto"
                  name="name"
                  data-testid="name"
                />
                <div className="invalid-feedback d-block">
                  {errors.name?.message}
                </div>
              </div>

              <div className="margin-bottom-30">
                <label htmlFor="categories" className="d-none">Categorias</label>
                <Controller //
                  name="categories" //nome do campo, tem q ser igual o nome do estado e do tipo Product
                  rules={{ required: true }} //regra de validação
                  control={control}
                  render={(
                    { field } //integra o select do formulário com o campo gerenciado pelo react-hook-form
                  ) => (
                    <Select
                      {...field}
                      options={selectCategories} //categorias carregadas do backend
                      placeholder="Categoria"
                      classNamePrefix="product-crud-select"
                      isMulti
                      getOptionLabel={(category: Category) => category.name} //recebe o item da lista e coloca o nome da categoria
                      getOptionValue={(category: Category) =>
                        String(category.id)
                      } //recebe o item da lista e coloca o valor da categoria
                      inputId="categories" //teste
                    />
                  )}
                />
                {
                  //se não colocar nenhuma categoria na hora de adicionar algum produto novo
                  errors.categories && (
                    <div className="invalid-feedback d-block">
                      Campo obrigatório
                    </div>
                  )
                }
              </div>

              <div className="margin-bottom-30">
                <Controller
                  name="price"
                  rules={{ required: 'Campo obrigatório' }}
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      placeholder="Preço"
                      className={`form-control base-input ${
                        errors.price ? 'is-invalid' : ''
                      }`} //mostra o campo vermelho
                      disableGroupSeparators={true} //desabilita o ponto de milhar
                      value={field.value} // valor do campo
                      onValueChange={field.onChange} //evento de quando mudar o estado do input
                      data-testid="price"
                    />
                  )}
                />

                <div className="invalid-feedback d-block">
                  {errors.price?.message}
                </div>
              </div>

              <div className="margin-bottom-30">
                <input
                  {...register('imgUrl', {
                    required: 'Campo obrigatório',
                    pattern: {
                      value: /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/gm,
                      message: 'Deve ser uma url válida',
                    },
                  })}
                  type="text"
                  className={`form-control base-input ${
                    errors.name ? 'is-invalid' : ''
                  }`} //mostra o campo vermelho
                  placeholder="Url da imagem do produto"
                  name="imgUrl"
                  data-testid="imgUrl"
                />
                <div className="invalid-feedback d-block">
                  {errors.imgUrl?.message}
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div>
                <textarea
                  rows={10}
                  {...register('description', {
                    required: 'Campo obrigatório',
                  })}
                  className={`form-control base-input h-auto ${
                    errors.price ? 'is-invalid' : ''
                  }`} //mostra o campo vermelho
                  placeholder="Descrição"
                  name="description"
                  data-testid="description"
                />
                <div className="invalid-feedback d-block">
                  {errors.description?.message}
                </div>
              </div>
            </div>
          </div>
          <div className="product-crud-buttons-container">
            <button
              className="btn btn-outline-danger product-crud-button"
              onClick={handleCancel}
            >
              CANCELAR
            </button>
            <button className="btn btn-outline-primary  product-crud-button">
              SALVAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Form;
