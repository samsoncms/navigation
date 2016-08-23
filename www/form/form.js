/**
 * Created by p.onysko on 03.03.14.
 */
var loader = new Loader(s('body'));

function CMSNavigationFormInit(tree) {
    tree.treeview(
        true,
        function(tree) {
            CMSNavigationFormInit(tree);
        }
    );

    // Флаг нажатия на кнопку управления
    var ControlFormOpened = false;

    // Указатель на текущий набор кнопок управления
    var ControlElement = null;

    var parent;
    /**
    * обработчик добавления новой записи
    */
    s(".control.add", tree).tinyboxAjax({
        html:'html',
        renderedHandler: function(response, tb) {
            /** автоматический транслит Урл*/
            s("#Name").keyup(function(obj) {
                s("#Url").val(s("#Name").translit());
            });
            /** транслит по кнопке */
            s("#generateUrl").click(function(obj) {
                if (confirm("Вы точно хотите сгенерировать адрес?")) {
                    s("#Url").val(s("#Name").translit());
                }
            });
            s(".form2").ajaxSubmit(function(response) {
                s('.sub_menu').html(response.sub_menu);
                parent.html(response.tree);
                CMSNavigationFormInit(parent);
                AppNavigationInitSubMenu();
                tb.close();
            }, function(form) {
                s('input[type="submit"]', form).a('disabled', 'disabled');
                return true;
            });
            s(".cancel-button").click(function() {
                tb.close();
            });
            //CMSNavigationFormInit();
        },
        beforeHandler: function(link) {
            parent = link.parent(' sjs-treeview');
            loader.show(s('#loader-text').html(), true);
            return true;
        },
        responseHandler: function() {
            loader.hide();
            return true;
        }
    });
    /**
     * обработчик редактирование новой записи
     */
    s(".control.editstr", tree).tinyboxAjax({
        html:'html',
        renderedHandler: function(response, tb) {

            var generateApplicationElement = s("#generate-application"),
                outputApplicationElement = s("#output-application"),
                iconPreviewApplicationElement = s(".preview-icon-application"),
                typeStructureElement = s(".type-of-structure"),
                iconApplicationElement = s("#icon-application"),
                allowTypeValues = [0], // That is all allowed values of select structure which can open applicaiton setting
                applicationBlock = s('.application-setting'),
                faClasses = 'icon icon2 fa-2x icon2-';

            // Handle generate application checkbox
            generateApplicationElement.click(function(e) {
                var value = e.DOMElement.checked,
                    blockOutput = s('.block-show-output-application');

                // If true show output block or hide it
                if (value) {
                    blockOutput.css('display', 'block');
                } else {
                    blockOutput.css('display', 'none');
                }
            });

            // Change icon of preview block
            iconApplicationElement.change(function(e) {
                s('span', iconPreviewApplicationElement).a('class', faClasses + e.val());
            });

            // Set event on change type of structure
            typeStructureElement.change(changeFormApplicationByTypeStructure);

            // Exec manually when the first loaded
            changeFormApplicationByTypeStructure();

            /**
             * Show or hide application setting by structure type
             */
            function changeFormApplicationByTypeStructure() {
                var value = typeStructureElement.val();

                // If there is right value than open application setting
                if (allowTypeValues.indexOf(parseInt(value)) !== -1) {
                    applicationBlock.css('display', 'block');
                } else {
                    // Set manually false value of checkboxes
                    generateApplicationElement.DOMElement.checked = false;
                    applicationBlock.css('display', 'none');
                }
            }

            s("#generateUrl").click(function(obj) {
                if (confirm("Вы точно хотите сгенерировать адрес?")) {
                    s("#Url").val(s("#Name").translit());
                }
            });
            s(".form2").ajaxSubmit(function(response) {
                s('.sub_menu').html(response.sub_menu);
                parent.html(response.tree);
                CMSNavigationFormInit(parent);
                AppNavigationInitSubMenu();
                tb.close();
            }, function(form){
                console.log(s('#Name', form));
                if(s('#Name', form).val() === '') {
                    return false;
                }
            });
            s(".cancel-button").click(function() {
                tb.close();
            });
        },
        beforeHandler: function(link) {
            parent = link.parent(' sjs-treeview');
            loader.show(s('#loader-text').html(), true);
            return true;
        },
        responseHandler: function() {
            loader.hide();
            return true;
        }
    });

    /**
     * обработка удаления
     */
    s(".control.delete", tree).ajaxClick(function(response) {
        parent.html(response.tree);
        CMSNavigationFormInit(parent);
        s('.sub_menu').html(response.sub_menu);
        AppNavigationInitSubMenu();
        loader.hide();
    }, function(link) {
        parent = link.parent(' sjs-treeview');
        if (confirm("Вы уверены, что хотите безвозвратно удалить структуру?")) {
            loader.show('Удаление структуры', true);
            return true;
        } else {
            return false;
        }
    });

    s('.control.fields', tree).tinyboxAjax({
        html : 'html',
        renderedHandler: function(response, tb){
            fieldForm(response, tb);
        },
        beforeHandler: function() {
            loader.show(s('#loader-text').html(), true);
            return true;
        },
        responseHandler: function() {
            loader.hide();
            return true;
        }
    });

    /**
     * обработка изменения позиции элемента в дереве
     */
    s(".control.move-up", tree).ajaxClick(function(response) {
        s(".tree-container").html(response.tree);
        CMSNavigationFormInit(s(".tree-container"));
        s('.sub_menu').html(response.sub_menu);
        AppNavigationInitSubMenu();
        loader.hide();
    }, function() {
        loader.show('Обновление дерева', true);
        return true;
    });
    s(".control.move-down", tree).ajaxClick(function(response) {
        s(".tree-container").html(response.tree);
        CMSNavigationFormInit(s(".tree-container"));
        s('.sub_menu').html(response.sub_menu);
        AppNavigationInitSubMenu();
        s( '.structure-element' )
            .mouseover( function(el){ if(!ControlFormOpened) { s( '.control-buttons', el ).show(); ControlElement = el; } })
            .mouseout( 	function(el){ if(!ControlFormOpened) s( '.control-buttons', el ).hide(); });
        loader.hide();
    }, function() {
        loader.show('Обновление дерева', true);
        return true;
    });

    s('.open', s('.noChildren', tree)).click(function() {
        return false;
    });
    s(".open", s('.hasChildren', tree)).ajaxClick(function(response) {
        s("#data").html(response.tree);
        CMSNavigationFormInit(s("#data"));
        s('.sub_menu').html(response.sub_menu);
        AppNavigationInitSubMenu();
        s(".all").removeClass('active');

        loader.hide();
    }, function() {
        loader.show('Открытие структуры', true);
        return true;
    });
}

function AppNavigationInitSubMenu() {


    /**
     * обработчик для кнопки "верхнего" меню (sub_menu)
     */
    s("#newSSE").tinyboxAjax({
        html:'html',
        renderedHandler: function(response, tb) {
            /** автоматический транслит Урл*/
            s("#Name").keyup(function(obj) {
                s("#Url").val(s("#Name").translit());
            });
            /** транслит по кнопке */
            s("#generateUrl").click(function(obj) {
                if (confirm("Вы точно хотите сгенерировать адрес?")) {
                    s("#Url").val(s("#Name").translit());
                }
            });
            s(".form2").ajaxSubmit(function(response) {
                s(".tree-container").html(response.tree);
                CMSNavigationFormInit(s(".tree-container"));
                tb.close();
            }, function(form) {
                var nameInput = s('#Name', form);
                if(nameInput.val() === '') {
                    var errorElement = document.createElement('div');
                    errorElement.innerHTML = 'Field name can not be empty';
                    errorElement.style.color = 'red';
                    nameInput.parent().prepend(errorElement);
                    return false;
                }
                s('input[type="submit"]', form).a('disabled', 'disabled');
                return true;
            });
            s(".cancel-button").click(function() {
                tb.close();
            });
        },
        beforeHandler: function() {
            loader.show(s('#loader-text').html(), true);
            return true;
        },
        responseHandler: function() {
            loader.hide();
            return true;
        }
    });

    s(".all").ajaxClick(function(response) {
        s('.sub_menu').html(response.sub_menu);
        s("#data").html(response.tree);
        CMSNavigationFormInit(s('#data'));
        AppNavigationInitSubMenu();
        s(".all").addClass('active');

        loader.hide();
    }, function() {
        loader.show('Открытие структуры', true);
        return true;
    });
}

s('#structure').pageInit(function() {
    AppNavigationInitSubMenu();

    CMSNavigationFormInit(s(".tree-container")); //инициализация событий
});
