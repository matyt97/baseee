# Apuntes de Base de Datos — Universidad Central
### Enfoque: Modelo Relacional | Oracle XE + SQL Developer + SQL Data Modeler

---

## ÍNDICE
1. [Prueba 1: Modelo Relacional](#prueba-1-modelo-relacional)
2. [El schema HR de Oracle](#el-schema-hr-de-oracle)
3. [Prueba 2 y 3: SQL](#prueba-2-y-3-sql)
4. [Queries de clase, explicadas](#queries-de-clase-explicadas)
5. [Ejercicios de práctica](#ejercicios-de-práctica)
6. [Cheat sheet Oracle SQL](#cheat-sheet-oracle-sql)

---

## PRUEBA 1: MODELO RELACIONAL

### 1.1 Conceptos base

| Término formal | Equivalente informal |
|---|---|
| Relación | Tabla |
| Tupla | Fila / registro |
| Atributo | Columna / campo |
| Dominio | Conjunto de valores válidos para un atributo (ej: dominio de `salary` = números positivos) |
| Grado | Cantidad de atributos (columnas) de una relación |
| Cardinalidad | Cantidad de tuplas (filas) de una relación |

**Regla de oro:** en el modelo relacional TODO se representa en tablas. No hay punteros, no hay jerarquías: solo tablas y relaciones lógicas entre ellas mediante claves.

### 1.2 Tipos de claves

- **Superclave**: cualquier conjunto de atributos que identifica de forma única una tupla (puede tener atributos de más).
- **Clave candidata**: superclave mínima (sin atributos redundantes).
- **Clave primaria (PK)**: la clave candidata elegida para identificar la tabla. No puede ser NULL, no se repite.
- **Clave foránea (FK)**: atributo(s) en una tabla que referencia la PK de otra tabla. Así se materializan las relaciones entre tablas.
- **Clave alternativa**: clave candidata que no fue elegida como PK.

### 1.3 Reglas de integridad

- **Integridad de entidad**: la PK nunca puede ser NULL.
- **Integridad referencial**: toda FK debe apuntar a un valor que exista como PK en la tabla referenciada (o ser NULL, si la relación es opcional).

### 1.4 Cardinalidad de las relaciones

Notación **"pata de gallo" (crow's foot)** — la que usa el diagrama que mostró el profe:

- Línea simple = lado **"uno"**
- Línea con horquilla/triángulo = lado **"muchos"**
- Línea **sólida** = participación obligatoria (NOT NULL)
- Línea **punteada** = participación opcional (permite NULL)

Tipos de relación:
- **1:1** — un registro de A se relaciona con un único registro de B
- **1:N** — un registro de A se relaciona con varios de B (la más común: ej. un departamento tiene varios empleados)
- **N:M** — varios registros de A con varios de B (se resuelve creando una tabla intermedia con dos FK)

### 1.5 Relaciones reflexivas

Una tabla se relaciona consigo misma. Aparece dos veces en el diagrama del profe:
- **DEPARTMENTS.manager_id** → apunta a un `employee_id` (el jefe del departamento es un empleado)
- **EMPLOYEES.manager_id** → apunta a otro `employee_id` (un empleado reporta a otro empleado)

Esto suele ser lo que más cuesta entender: la FK vive en la misma tabla que referencia.

### 1.6 Normalización

- **1FN**: valores atómicos (no listas ni grupos repetidos en una celda), sin filas duplicadas.
- **2FN**: cumple 1FN + todo atributo no clave depende de la PK **completa** (relevante solo si la PK es compuesta).
- **3FN**: cumple 2FN + no hay dependencias transitivas (un atributo no clave no puede depender de otro atributo no clave).
- **BCNF**: versión más estricta de 3FN, todo determinante debe ser una clave candidata.

**Anomalías que la normalización evita:**
- De inserción: no poder agregar un dato sin tener otro que aún no existe.
- De actualización: tener que modificar el mismo dato en varias filas.
- De borrado: perder información al eliminar una fila.

### 1.7 Paso de modelo conceptual a modelo relacional

Reglas generales:
1. Cada entidad → una tabla.
2. Cada atributo → una columna.
3. Relación 1:N → la FK va en la tabla del lado "muchos".
4. Relación N:M → se crea una tabla intermedia con las FK de ambas tablas (esa tabla suele tener PK compuesta).
5. Relación 1:1 → la FK puede ir en cualquiera de las dos tablas (se elige la más lógica).

---

## EL SCHEMA HR DE ORACLE

Es el schema de ejemplo que trae Oracle XE. Muy probablemente el profe lo use en las 3 pruebas.

### Tablas y su función

| Tabla | Descripción | PK |
|---|---|---|
| REGIONS | Regiones geográficas | region_id |
| COUNTRIES | Países, agrupados por región | country_id |
| LOCATIONS | Ubicaciones físicas (oficinas) | location_id |
| DEPARTMENTS | Departamentos de la empresa | department_id |
| JOBS | Cargos/puestos de trabajo | job_id |
| EMPLOYEES | Empleados | employee_id |
| JOB_HISTORY | Historial de cargos anteriores de cada empleado | employee_id + start_date (PK compuesta) |

### Relaciones (de "uno" a "muchos")

```
REGIONS (1) ──── (N) COUNTRIES
COUNTRIES (1) ──── (N) LOCATIONS
LOCATIONS (1) ──── (N) DEPARTMENTS
DEPARTMENTS (1) ──── (N) EMPLOYEES
JOBS (1) ──── (N) EMPLOYEES
DEPARTMENTS (1) ──── (N) JOB_HISTORY
JOBS (1) ──── (N) JOB_HISTORY
EMPLOYEES (1) ──── (N) JOB_HISTORY

-- Relaciones reflexivas:
EMPLOYEES.manager_id → EMPLOYEES.employee_id
DEPARTMENTS.manager_id → EMPLOYEES.employee_id
```

### Columnas clave de cada tabla

- **EMPLOYEES**: employee_id (PK), first_name, last_name, email, phone_number, hire_date, job_id (FK), salary, commission_pct, manager_id (FK reflexiva), department_id (FK)
- **DEPARTMENTS**: department_id (PK), department_name, manager_id (FK reflexiva), location_id (FK)
- **JOBS**: job_id (PK), job_title, min_salary, max_salary
- **JOB_HISTORY**: employee_id (FK/PK compuesta), start_date (PK compuesta), end_date, job_id (FK), department_id (FK)
- **LOCATIONS**: location_id (PK), street_address, postal_code, city, state_province, country_id (FK)
- **COUNTRIES**: country_id (PK), country_name, region_id (FK)
- **REGIONS**: region_id (PK), region_name

**Tip de estudio:** redibuja este diagrama de memoria 2-3 veces hasta que te salga completo sin mirar, incluyendo las dos relaciones reflexivas.

---

## PRUEBA 2 Y 3: SQL

### 2.1 Categorías del lenguaje SQL

- **DDL** (Data Definition Language): `CREATE`, `ALTER`, `DROP` — define estructura
- **DML** (Data Manipulation Language): `INSERT`, `UPDATE`, `DELETE` — manipula datos
- **DQL** (Data Query Language): `SELECT` — consulta datos
- **TCL** (Transaction Control Language): `COMMIT`, `ROLLBACK`, `SAVEPOINT`

### 2.2 Orden lógico de ejecución de un SELECT

Aunque se **escribe** en este orden:
```
SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY ...
```

Se **ejecuta** en este orden:
```
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY
```

Esto explica por qué puedes filtrar en el `WHERE` por una columna que no aparece en el `SELECT`.

### 2.3 Particularidades de Oracle (vs. MySQL/PostgreSQL)

| Oracle | Otros motores |
|---|---|
| `VARCHAR2` | `VARCHAR` |
| Secuencias (`CREATE SEQUENCE`) | `AUTO_INCREMENT` |
| `SYSDATE` | `NOW()` / `CURRENT_DATE` |
| `DUAL` (tabla dummy) | No siempre existe |
| `ROWNUM` / `FETCH FIRST n ROWS ONLY` | `LIMIT` |
| `MONTHS_BETWEEN`, `ADD_MONTHS` | Funciones de fecha propias |

---

## QUERIES DE CLASE, EXPLICADAS

### Query 1 — antigüedad de empleados por departamento

```sql
SELECT FIRST_NAME, LAST_NAME, DEPARTMENT_NAME, 
       ROUND(MONTHS_BETWEEN(SYSDATE, HIRE_DATE)/12)
FROM EMPLOYEES JOIN DEPARTMENTS USING(DEPARTMENT_ID)
WHERE SALARY > 20000
ORDER BY DEPARTMENT_NAME;
```

**Qué hace:** lista nombre, apellido, departamento y años de antigüedad de empleados con sueldo > 20.000, ordenados por departamento.

- `JOIN ... USING(DEPARTMENT_ID)`: forma corta de INNER JOIN cuando la columna de unión se llama igual en ambas tablas. No se puede anteponer alias a esa columna, y no se duplica en el resultado. Equivale a:
  ```sql
  FROM EMPLOYEES E JOIN DEPARTMENTS D ON E.DEPARTMENT_ID = D.DEPARTMENT_ID
  ```
- `SYSDATE`: fecha/hora actual del sistema (propio de Oracle).
- `MONTHS_BETWEEN(fecha1, fecha2)`: meses entre dos fechas.
- `/12`: convierte meses a años.
- `ROUND(...)`: redondea a entero.
- `WHERE SALARY > 20000`: filtra antes de mostrar u ordenar.
- `ORDER BY DEPARTMENT_NAME`: orden alfabético ascendente (default).

> *(Espacio para agregar más queries que el profe muestre en clase — pégalas aquí con su explicación para mantener este apunte actualizado.)*

---

## EJERCICIOS DE PRÁCTICA

### Modelo relacional (Prueba 1)

1. Dibuja el modelo relacional para un sistema de **biblioteca**: libros, autores, socios, préstamos. Identifica PK, FK y cardinalidad de cada relación. Piensa si hay alguna relación N:M (pista: un libro puede tener varios autores, un autor puede escribir varios libros).
2. Dibuja el modelo relacional para un sistema de **ventas**: clientes, productos, pedidos, detalle de pedido. Identifica por qué "detalle de pedido" suele ser una tabla intermedia con PK compuesta.
3. A partir del schema HR: explica con tus palabras por qué `EMPLOYEES.manager_id` es una relación reflexiva y qué pasa si ese campo permite NULL (pista: el gerente general no tiene jefe).

### SQL (Pruebas 2 y 3)

1. Lista el nombre completo (first_name + last_name) y el sueldo de los empleados del departamento "IT", ordenados de mayor a menor sueldo.
2. Cuenta cuántos empleados hay por departamento (usa `GROUP BY` + `COUNT`).
3. Lista los departamentos cuyo sueldo promedio de empleados supera los 8.000 (usa `GROUP BY` + `HAVING`).
4. Lista el nombre del empleado junto con el nombre de su jefe directo (self-join sobre EMPLOYEES usando `manager_id`).
5. Lista empleados junto con el nombre de la ciudad donde trabajan (requiere encadenar JOIN entre EMPLOYEES → DEPARTMENTS → LOCATIONS).

---

## CHEAT SHEET ORACLE SQL

```sql
-- Estructura básica
SELECT columna1, columna2
FROM tabla
WHERE condicion
GROUP BY columna
HAVING condicion_grupo
ORDER BY columna [ASC|DESC];

-- JOIN explícito
FROM tablaA A JOIN tablaB B ON A.id = B.id

-- JOIN corto (columna con mismo nombre)
FROM tablaA JOIN tablaB USING(id)

-- LEFT / RIGHT / FULL JOIN
FROM tablaA LEFT JOIN tablaB ON A.id = B.id

-- Funciones de agregación
COUNT(*), SUM(col), AVG(col), MIN(col), MAX(col)

-- Funciones de fecha (Oracle)
SYSDATE
MONTHS_BETWEEN(fecha1, fecha2)
ADD_MONTHS(fecha, n)
ROUND(numero, decimales)

-- Subconsulta
SELECT * FROM tabla WHERE columna IN (SELECT columna FROM otra_tabla WHERE ...);

-- DDL básico
CREATE TABLE nombre (
  id NUMBER PRIMARY KEY,
  nombre VARCHAR2(50) NOT NULL,
  fk_id NUMBER REFERENCES otra_tabla(id)
);

-- DML básico
INSERT INTO tabla (col1, col2) VALUES (val1, val2);
UPDATE tabla SET col1 = valor WHERE condicion;
DELETE FROM tabla WHERE condicion;
```

---

*Apunte vivo: ve agregando aquí las queries y ejemplos exactos que muestre el profe en clase para que el material calce 100% con lo que van a evaluar.*
