const BASE_URL = 'http://localhost:3000/api/investimentos';

const inicializar_tooltips = () => {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        const tooltipInstance = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
        if (tooltipInstance) {
            tooltipInstance.dispose();
        }
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
};

$(document).ready(function () {
    const $formulario = $('#formulario_investimento');
    const $input_id = $('#id_investimento');
    const $input_tipo = $('#tipo_investimento');
    const $input_valor = $('#valor_investimento');
    const $input_data = $('#dta_investimento');
    const $btn_salvar = $('#btn_salvar');
    const $btn_alterar = $('#btn_alterar');
    const $btn_excluir = $('#btn_excluir');
    const $btn_cancelar = $('#btn_cancelar');
    const $btn_buscar = $('#btn_buscar');
    const $campo_busca = $('#campo_busca');
    const $mensagem_feedback = $('#mensagem_feedback');
    const $texto_feedback = $('#texto_feedback');
    const $corpo_tabela = $('#corpo_tabela_investimentos');
    const $valor_total = $('#valor_total');
    const $mensagem_vazio = $('#mensagem_sem_dados');
    const $elemento_modal_exclusao = $('#modal_confirmacao_exclusao');
    const modal_exclusao = new bootstrap.Modal($elemento_modal_exclusao[0]);
    const $btn_confirmar_exclusao = $('#btn_confirmar_exclusao');

    let id_investimento_para_excluir = null;

    const exibir_feedback = (mensagem, tipo = 'success') => {
        $texto_feedback.text(mensagem);
        $mensagem_feedback
            .removeClass()
            .addClass(`alert alert-${tipo} alert-dismissible fade show`)
            .removeClass('d-none')
            .show();

        const alerta = bootstrap.Alert.getOrCreateInstance($mensagem_feedback[0]);

        setTimeout(() => {
            alerta.close();
        }, 4000);
    };

    const formatar_moeda = (valor) => valor.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

    const formatar_data = (data) => {
        const data_obj = new Date(data);
        const dia = String(data_obj.getDate()).padStart(2, '0');
        const mes = String(data_obj.getMonth() + 1).padStart(2, '0');
        const ano = data_obj.getFullYear();
        return `${dia}/${mes}/${ano}`;
    };

    const limpar_formulario = () => {
        $formulario[0].reset();
        $input_id.val('');
        $btn_alterar.addClass('d-none');
        $btn_excluir.addClass('d-none');
        $btn_cancelar.addClass('d-none');
        $btn_salvar.removeClass('d-none');
        $input_tipo.focus();
    };

    const salvar_investimento = () => {
        const payload = {
            tipo_investimento: $input_tipo.val(),
            valor_investimento: parseFloat($input_valor.val()),
            data_investimento: $input_data.val()
        };

        if (!payload.tipo_investimento || isNaN(payload.valor_investimento) || !payload.data_investimento || payload.valor_investimento <= 0) {
            exibir_feedback('Preencha todos os campos corretamente.', 'danger');
            return;
        }

        $.ajax({
            url: BASE_URL,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: () => {
                exibir_feedback('Investimento salvo com sucesso!', 'success');
                limpar_formulario();
                carregar_investimentos();
            },
            error: (xhr) => {
                exibir_feedback('Erro ao salvar investimento.', 'danger');
                console.error(xhr.responseText);
            }
        });
    };

    const buscar_investimento = () => {
        const termo = $campo_busca.val().trim();
        carregar_investimentos(termo);
    };

    const carregar_para_edicao = (id) => {
        $.get(`${BASE_URL}/${id}`, function (inv) {
            $input_id.val(inv.id_investimento);
            $input_tipo.val(inv.tipo_investimento);
            $input_valor.val(inv.valor_investimento);

            const data_formatada = new Date(inv.data_investimento).toISOString().split('T')[0];
            $input_data.val(data_formatada);

            $btn_salvar.addClass('d-none');
            $btn_alterar.removeClass('d-none');
            $btn_excluir.removeClass('d-none');
            $btn_cancelar.removeClass('d-none');

            exibir_feedback('Investimento carregado para edição.', 'info');
            window.scrollTo({top: 0, behavior: 'smooth'});
        });
    };

    const alterar_investimento = () => {
        const id = $input_id.val();
        const payload = {
            tipo_investimento: $input_tipo.val(),
            valor_investimento: parseFloat($input_valor.val()),
            data_investimento: $input_data.val()
        };

        if (!id || !payload.tipo_investimento || isNaN(payload.valor_investimento) || !payload.data_investimento || payload.valor_investimento <= 0) {
            exibir_feedback('Preencha todos os campos corretamente.', 'danger');
            return;
        }

        $.ajax({
            url: `${BASE_URL}/${id}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: () => {
                exibir_feedback('Alteração feita com sucesso!', 'success');
                limpar_formulario();
                carregar_investimentos();
            },
            error: (xhr) => {
                exibir_feedback('Alteração não foi efetuada.', 'danger');
                console.error(xhr.responseText);
            }
        });
    };

    const excluir_investimento = (id) => {
        if (!id) {
            exibir_feedback('ID inválido para exclusão.', 'warning');
            return;
        }

        $.ajax({
            url: `${BASE_URL}/${id}`,
            method: 'DELETE',
            success: () => {
                exibir_feedback('Registro excluído com sucesso!', 'success');
                limpar_formulario();
                carregar_investimentos();
            },
            error: (xhr) => {
                exibir_feedback('Erro ao excluir o registro.', 'danger');
                console.error(xhr.responseText);
            }
        });
    };

    const carregar_investimentos = (termoBusca = '') => {
        const url = termoBusca ? `${BASE_URL}/tipo/${termoBusca}` : BASE_URL;

        $.get(url, function (dados) {
            $corpo_tabela.empty();

            if (!dados.length) {
                $mensagem_vazio.show();
                $valor_total.text('');
                if (termoBusca) exibir_feedback('Nenhum investimento encontrado para a busca.', 'info');
                return;
            }

            $mensagem_vazio.hide();

            dados.sort((a, b) => new Date(b.data_investimento) - new Date(a.data_investimento));

            let total = 0;
            dados.forEach(inv => {
                total += parseFloat(inv.valor_investimento);

                const linha = $(`
                    <tr>
                        <td>${inv.tipo_investimento}</td>
                        <td class="valor_positivo">${formatar_moeda(inv.valor_investimento)}</td>
                        <td>${formatar_data(inv.data_investimento)}</td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-outline-warning me-2 btn_editar" 
                                    data-id="${inv.id_investimento}" 
                                    data-bs-toggle="tooltip" 
                                    title="Editar">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn_excluir" 
                                    data-id="${inv.id_investimento}" 
                                    data-bs-toggle="tooltip" 
                                    title="Excluir">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `);
                $corpo_tabela.append(linha);
            });

            $valor_total.text(`Total: ${formatar_moeda(total)}`);
            inicializar_tooltips();
        }).fail(function (xhr) {
            exibir_feedback('Erro ao carregar investimentos.', 'danger');
            console.error(xhr.responseText);
        });
    };

    $formulario.on('submit', function (e) {
        e.preventDefault();
        if ($input_id.val()) {
            alterar_investimento();
        } else {
            salvar_investimento();
        }
    });

    $btn_buscar.on('click', buscar_investimento);
    $campo_busca.on('keyup', function (e) {
        if (e.key === 'Enter') {
            buscar_investimento();
        }
    });


    $btn_cancelar.on('click', limpar_formulario);
    $btn_excluir.on('click', function () {
        id_investimento_para_excluir = $input_id.val();
        modal_exclusao.show();
    });


    $corpo_tabela.on('click', '.btn_editar', function () {
        const id = $(this).data('id');
        carregar_para_edicao(id);
    });

    $corpo_tabela.on('click', '.btn_excluir', function () {
        id_investimento_para_excluir = $(this).data('id');
        modal_exclusao.show();
    });

    $btn_confirmar_exclusao.on('click', function () {
        if (id_investimento_para_excluir) {
            excluir_investimento(id_investimento_para_excluir);
            id_investimento_para_excluir = null;
            modal_exclusao.hide();
        }
    });

    limpar_formulario();
    carregar_investimentos();
});