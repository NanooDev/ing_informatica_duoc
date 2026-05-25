DECLARE
    --
    RUT           CLIENTE.RUTCLIENTE%TYPE;
    NOMBRE        CLIENTE.NOMBRE%TYPE;
    DIRECCION     CLIENTE.DIRECCION%TYPE;
    ID_COMUNA     COMUNA.CODCOMUNA%TYPE;
    NOM_COMUNA    COMUNA.DESCRIPCION%TYPE;
    TELEFONO      CLIENTE.TELEFONO%TYPE;
    ESTADO        CLIENTE.ESTADO%TYPE;
    MAIL          CLIENTE.MAIL%TYPE;
    CREDITO       CLIENTE.CREDITO%TYPE;
    SALDO         CLIENTE.SALDO%TYPE;
    --
    --
    BUSCAR_RUT    CLIENTE.RUTCLIENTE%TYPE := '6245678-1'; 
    --
BEGIN
    --
    SELECT
        --
        cli.RUTCLIENTE,
        cli.NOMBRE,
        cli.DIRECCION,
        co.CODCOMUNA,
        co.DESCRIPCION,
        cli.TELEFONO,
        cli.ESTADO,
        cli.MAIL,
        cli.CREDITO,
        cli.SALDO
        --
      --
      INTO
        --
        RUT,
        NOMBRE,
        DIRECCION,
        ID_COMUNA,
        NOM_COMUNA,
        TELEFONO,
        ESTADO,
        MAIL,
        CREDITO,
        SALDO
        --
      FROM CLIENTE cli 
      JOIN COMUNA co ON (cli.codcomuna = co.codcomuna)
      WHERE cli.RUTCLIENTE = BUSCAR_RUT;
      --
        
    DBMS_OUTPUT.PUT_LINE('DATOS DEL CLIENTE');
    DBMS_OUTPUT.PUT_LINE('Rut Cliente   : ' || RUT);
    DBMS_OUTPUT.PUT_LINE('Nombre Cliente: ' || NOMBRE);
    DBMS_OUTPUT.PUT_LINE('Dirección     : ' || DIRECCION);
    DBMS_OUTPUT.PUT_LINE('Código Comuna : ' || ID_COMUNA);
    DBMS_OUTPUT.PUT_LINE('Nombre Comuna : ' || NOM_COMUNA);
    DBMS_OUTPUT.PUT_LINE('Teléfono      : ' || TELEFONO);
    DBMS_OUTPUT.PUT_LINE('Estado        : ' || ESTADO);
    DBMS_OUTPUT.PUT_LINE('Mail          : ' || MAIL);
    DBMS_OUTPUT.PUT_LINE('Crédito       : ' || CREDITO);
    DBMS_OUTPUT.PUT_LINE('Saldo         : ' || SALDO);

EXCEPTION
    --
    WHEN OTHERS THEN
        --
        DBMS_OUTPUT.PUT_LINE('Error inesperado: ' || SQLERRM);
        --
    --
END;