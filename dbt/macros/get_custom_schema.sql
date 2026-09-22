{# Sem isso, o dbt gera "<schema do profile>_staging" em vez de só
   "staging" — queremos os schemas exatos staging/intermediate/marts,
   independente do schema configurado no profile de conexão. #}
{% macro generate_schema_name(custom_schema_name, node) -%}
    {%- if custom_schema_name is none -%}
        {{ target.schema }}
    {%- else -%}
        {{ custom_schema_name | trim }}
    {%- endif -%}
{%- endmacro %}
