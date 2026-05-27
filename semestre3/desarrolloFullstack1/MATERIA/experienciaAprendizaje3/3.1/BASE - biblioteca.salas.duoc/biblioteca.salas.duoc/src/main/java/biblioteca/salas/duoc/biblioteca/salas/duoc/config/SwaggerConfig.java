package biblioteca.salas.duoc.biblioteca.salas.duoc.config;

import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API 2026 Reserva de Salas")
                        .version("1.0")
                        .description("Documentación de la API para el sistema de reserva de salas"));
    }
}
