package com.devsuperior.dscatalog.services;

import java.util.List;
import java.util.Optional;

import javax.persistence.EntityNotFoundException;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import com.devsuperior.dscatalog.dto.ProductDTO;
import com.devsuperior.dscatalog.entities.Category;
import com.devsuperior.dscatalog.entities.Product;
import com.devsuperior.dscatalog.repositories.CategoryRepository;
import com.devsuperior.dscatalog.repositories.ProductRepository;
import com.devsuperior.dscatalog.services.exceptions.DatabaseException;
import com.devsuperior.dscatalog.services.exceptions.ResourceNotFoundException;
import com.devsuperior.dscatalog.tests.Factory;

@ExtendWith(SpringExtension.class)
public class ProductServiceTests {

	@InjectMocks
	private ProductService service;
	
	@Mock
	private ProductRepository repository;
	
	@Mock
	private CategoryRepository categoryRepository;
	
	private long existingId;
	private long nonExistingId;
	private long dependentId;
	private PageImpl<Product> page;
	private Product product;
	private Category category;
	private ProductDTO productDTO;
	
	@BeforeEach
	void setUp() throws Exception{
		existingId = 1L;
		nonExistingId = 2L;
		dependentId = 3L;
		product = Factory.createdProduct();
		productDTO = Factory.createdProductDTO();
		category = Factory.createCategory();
		page = new PageImpl<>(List.of(product));
		
		
		Mockito.when(repository.findAll((Pageable)any())).thenReturn(page);//Quando chamar o repository.findAll passando alguma coisa do tipo Pageable, faça o retorno de um página.
		
		Mockito.when(repository.save(any())).thenReturn(product); //Quando chamar o repository.save passando alguma coisa, salva o produto
		
		Mockito.when(repository.findById(existingId)).thenReturn(Optional.of(product)); //Quando chamar o repository.findById passando um id existente, retorne o id 
		Mockito.when(repository.findById(nonExistingId)).thenReturn(Optional.empty()); //Quando chamar o repository.findById passando um id inexistente, retorne um Optional vazio
		
		Mockito.when(repository.find(any(), any(), any())).thenReturn(page);
		
		Mockito.when(repository.getOne(existingId)).thenReturn(product);
		Mockito.when(repository.getOne(nonExistingId)).thenThrow(EntityNotFoundException.class);
		
		Mockito.when(categoryRepository.getOne(existingId)).thenReturn(category);
		Mockito.when(categoryRepository.getOne(nonExistingId)).thenThrow(EntityNotFoundException.class);
		
		Mockito.doNothing().when(repository).deleteById(existingId); //simulando que o id existe para ser deletado
		Mockito.doThrow(EmptyResultDataAccessException.class).when(repository).deleteById(nonExistingId); //simulando que o id não existe e lançando exceção
		Mockito.doThrow(DataIntegrityViolationException.class).when(repository).deleteById(dependentId);
	}
	
	
	@Test
	public void updateShouldReturnProductDTOWhenExisting() {
		
		productDTO = Factory.createdProductDTO();
		
		ProductDTO result = service.update(existingId, productDTO);
		
		Assertions.assertNotNull(result);
	}
	
	@Test
	public void updateShouldThrowResourceNotFoundExceptionWhenIdDoesNotExist() {
		
		Assertions.assertThrows(ResourceNotFoundException.class, () -> {
			
			service.update(nonExistingId, productDTO);
		});	
	}
	
	@Test
	public void findByIdShouldReturnProductDTOWhenExisting() {
		
		 ProductDTO result = service.findById(existingId);
		
		Assertions.assertNotNull(result);
	}
	
	@Test
	public void findByIdShouldThrowResourceNotFoundExceptionWhenIdDoesNotExist() {
		
		Assertions.assertThrows(ResourceNotFoundException.class, () -> {
			
			service.findById(nonExistingId);
		});	
	}
	
	@Test
	public void FindAllPagedShouldReturnPage() {
		
		Pageable pageable = PageRequest.of(0, 10);
		
		Page<ProductDTO> result = service.findAllPaged(0L, "",pageable);
		
		Assertions.assertNotNull(result);
	}
	
	@Test 
	public void deleteShouldDoNothingWhenIdExists() {
		
		Assertions.assertDoesNotThrow(() -> {
			service.delete(existingId);
		});
		
		Mockito.verify(repository, Mockito.times(1)).deleteById(existingId);
	}
	
	@Test
	public void deleteShoulThrowResourceNotFoundExceptionWhenIdExists() {
		
		Assertions.assertThrows(ResourceNotFoundException.class, () -> {
			service.delete(nonExistingId);
		});
		
		Mockito.verify(repository, Mockito.times(1)).deleteById(nonExistingId);
	}
	
	@Test
	public void deleteShoulDatabaseExceptionWhenIdExists() {
		
		Assertions.assertThrows(DatabaseException.class, () -> {
			service.delete(dependentId);
		});
		
		Mockito.verify(repository, Mockito.times(1)).deleteById(dependentId);
	}
	
}
