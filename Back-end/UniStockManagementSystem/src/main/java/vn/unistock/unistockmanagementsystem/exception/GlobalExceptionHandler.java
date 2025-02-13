package vn.unistock.unistockmanagementsystem.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@ControllerAdvice
public class GlobalExceptionHandler{
    @ExceptionHandler(value = RuntimeException.class)
    ResponseEntity<Error> handleRuntimeException(RuntimeException exception){
        Error error = new Error();
        error.setCode(1001);
        error.setMessage(exception.getMessage());
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<String> handleMethodArgumentNotValidException(MethodArgumentNotValidException exception){
        return ResponseEntity.badRequest().body(exception.getFieldError().getDefaultMessage());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<String> handleTypeMismatchException(MethodArgumentTypeMismatchException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage());
    }

}
