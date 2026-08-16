/**
 * XOF Admin Chalkboard - Core JavaScript
 * 
 * @package   XOF_Admin_Chalkboard
 * @author    XOF Media
 * @license   GPL-3.0+
 * @link      https://xofmedia.com
 * @version   1.0.0
 */

jQuery(document).ready(function($) {

    const $titleInput = $('#xofac-chalkboard-title-input');
    const $input = $('#xofac-chalkboard-input');
    const $addButton = $('#xofac-chalkboard-add');
    const $spinner = $('#xofac-chalkboard-spinner');
    const $colorInput = $('#xofac-chalkboard-color-input');
    const $createContainer = $('#xofac-create-container');
    const $list = $('#xofac-chalkboard-list');

    // ============================================
    // Handle creating and prepending a new snippet
    // ============================================
    $addButton.on('click', function(e) {
        e.preventDefault();
        
        const titleValue = $titleInput.val().trim();
        const textValue = $input.val().trim();
        const colorValue = $colorInput.val();
        
        if (textValue === '') return;

        $spinner.addClass('is-active');
        $addButton.prop('disabled', true);

        $.post(xofacChalkboard.ajax_url, {
            action: 'xofac_add_snippet',
            nonce: xofacChalkboard.nonce,
            title: titleValue,
            text: textValue,
            color: colorValue
        }, function(response) {
            $spinner.removeClass('is-active');
            $addButton.prop('disabled', false);

            if (response.success) {
                $titleInput.val('');
                $input.val('');
                $colorInput.val('#fcfcfc');
                $createContainer.css('background-color', 'transparent');
                
                const newListItem = `
                    <li class="xofac-chalkboard-item" data-id="${response.data.id}" style="background-color: ${response.data.color};">
                        <div class="xofac-snippet-body">
                            <div class="xofac-snippet-title-wrapper">
                                <div class="xofac-snippet-title-bar">
                                    <div class="xofac-title-toggle-wrap" title="Click to Expand/Collapse">
                                        <span class="xofac-accordion-toggle"></span>
                                        <span class="xofac-title-text" style="color: #ffffff;">${response.data.title_html}</span>
                                    </div>
                                    <img src="${xofacChalkboard.plugin_url}images/xofac_chalkboard-title-edit-button_64x.png" class="xofac-title-edit-icon" title="${xofacChalkboard.i18n.editTitle}" alt="${xofacChalkboard.i18n.editTitle}" />
                                </div>
                                <div class="xofac-snippet-title-edit-container" style="display:none;">
                                    <input type="text" class="xofac-snippet-title-edit-input" value="${response.data.title_raw}" />
                                    <button type="button" class="button button-small xofac-title-save">${xofacChalkboard.i18n.save}</button>
                                </div>
                            </div>
                            
                            <div class="xofac-snippet-collapse-wrap">
                                <div class="xofac-snippet-actions-horizontal">
                                    <img src="${xofacChalkboard.plugin_url}images/xofac_chalkboard-copy-button_64x.png" class="xofac-action-icon xofac-chalkboard-copy" title="${xofacChalkboard.i18n.copySnippet}" alt="${xofacChalkboard.i18n.copySnippet}" />
                                    <img src="${xofacChalkboard.plugin_url}images/xofac_chalkboard-edit2-button_64x.png" class="xofac-action-icon xofac-chalkboard-edit" title="${xofacChalkboard.i18n.editSnippet}" alt="${xofacChalkboard.i18n.editSnippet}" />
                                </div>
                                <div class="xofac-snippet-content">${response.data.html}</div>
                                <textarea class="xofac-snippet-edit-input" style="display:none;">${response.data.raw}</textarea>
                                <div class="xofac-snippet-save-wrap" style="display:none;">
                                    <button type="button" class="button button-primary button-small xofac-chalkboard-save">${xofacChalkboard.i18n.saveSnippet}</button>
                                </div>
                            </div>
                        </div>
                        <div class="xofac-snippet-order-controls">
                            <div class="xofac-order-controls-top">
                                <div class="xofac-standard-order-icons">
                                    <img src="${xofacChalkboard.plugin_url}images/xofac_chalkboard-close2-button_64x.png" class="xofac-order-icon xofac-chalkboard-delete" title="${xofacChalkboard.i18n.deleteSnippet}" alt="${xofacChalkboard.i18n.deleteSnippet}" />
                                    <img src="${xofacChalkboard.plugin_url}images/xofac_chalkboard-drag-button_64x.png" class="xofac-order-icon xofac-drag-handle" title="${xofacChalkboard.i18n.dragToReorder}" alt="${xofacChalkboard.i18n.dragToReorder}" />
                                </div>
                                <div class="xofac-delete-confirm-tooltip" style="display:none;">
                                    <span>${xofacChalkboard.i18n.deleteConfirm}</span>
                                    <button type="button" class="button button-small xofac-confirm-delete-yes">${xofacChalkboard.i18n.yes}</button>
                                    <button type="button" class="button button-small xofac-confirm-delete-no">${xofacChalkboard.i18n.no}</button>
                                </div>
                            </div>
                            <div class="xofac-color-picker-container xofac-edit-color-picker" style="display:none;">
                                <input type="hidden" class="xofac-snippet-color-edit-input" value="${response.data.color}" />
                                <img src="${xofacChalkboard.plugin_url}images/xofac_chalkboard-rainbow-button_64x.png" class="xofac-action-icon xofac-rainbow-btn" title="${xofacChalkboard.i18n.chooseColor}" alt="${xofacChalkboard.i18n.chooseColor}" />
                                <div class="xofac-color-bar" style="display:none;">
                                    <div class="xofac-color-swatch" data-color="#fcfcfc" style="background-color: #e0e0e0;" title="${xofacChalkboard.i18n.colorDefault}"></div>
                                    <div class="xofac-color-swatch" data-color="#ffe5e5" style="background-color: #ff9999;" title="${xofacChalkboard.i18n.colorLightRed}"></div>
                                    <div class="xofac-color-swatch" data-color="#ffebd6" style="background-color: #ffb366;" title="${xofacChalkboard.i18n.colorLightOrange}"></div>
                                    <div class="xofac-color-swatch" data-color="#fffae6" style="background-color: #ffe680;" title="${xofacChalkboard.i18n.colorLightYellow}"></div>
                                    <div class="xofac-color-swatch" data-color="#e8f5e9" style="background-color: #99cc99;" title="${xofacChalkboard.i18n.colorLightGreen}"></div>
                                    <div class="xofac-color-swatch" data-color="#e3f2fd" style="background-color: #99c2ff;" title="${xofacChalkboard.i18n.colorLightBlue}"></div>
                                    <div class="xofac-color-swatch" data-color="#f3e5f5" style="background-color: #cc99ff;" title="${xofacChalkboard.i18n.colorLightPurple}"></div>
                                </div>
                            </div>
                        </div>
                    </li>
                `;
                
                $list.prepend(newListItem);
            } else {
                alert(xofacChalkboard.i18n.errorAdding + response.data);
            }
        });
    });

    // ===================================
    // Handle deletion UI and confirmation
    // ===================================
    $list.on('click', '.xofac-chalkboard-delete', function(e) {
        e.preventDefault();
        const $topControls = $(this).closest('.xofac-order-controls-top');
        
        $topControls.find('.xofac-standard-order-icons').hide();
        $topControls.find('.xofac-delete-confirm-tooltip').show();
    });

    $list.on('click', '.xofac-confirm-delete-no', function(e) {
        e.preventDefault();
        const $topControls = $(this).closest('.xofac-order-controls-top');
        
        $topControls.find('.xofac-delete-confirm-tooltip').hide();
        $topControls.find('.xofac-standard-order-icons').show();
    });

    $list.on('click', '.xofac-confirm-delete-yes', function(e) {
        e.preventDefault();
        
        const $listItem = $(this).closest('.xofac-chalkboard-item');
        const snippetId = $listItem.data('id');
        
        $listItem.css('opacity', '0.5');

        $.post(xofacChalkboard.ajax_url, {
            action: 'xofac_delete_snippet',
            nonce: xofacChalkboard.nonce,
            snippet_id: snippetId
        }, function(response) {
            if (response.success) {
                $listItem.slideUp(300, function() {
                    $(this).remove();
                });
            } else {
                $listItem.css('opacity', '1');
                alert(xofacChalkboard.i18n.errorDeleting);
                
                const $topControls = $listItem.find('.xofac-order-controls-top');
                $topControls.find('.xofac-delete-confirm-tooltip').hide();
                $topControls.find('.xofac-standard-order-icons').show();
            }
        });
    });

    // =============================================
    // Handle accordion expand and collapse behavior
    // =============================================
    $list.on('click', '.xofac-title-toggle-wrap', function(e) {
        e.preventDefault();
        const $item = $(this).closest('.xofac-chalkboard-item');
        const $collapseWrap = $item.find('.xofac-snippet-collapse-wrap');
        
        $collapseWrap.slideToggle(250, function() {
            $item.toggleClass('xofac-is-collapsed');
        });
    });

    // =====================================
    // Handle title editing state and saving
    // =====================================
    $list.on('click', '.xofac-title-edit-icon', function(e) {
        e.preventDefault();
        const $listItem = $(this).closest('.xofac-chalkboard-item');
        
        $listItem.find('.xofac-snippet-title-bar').hide();
        $listItem.find('.xofac-snippet-title-edit-container').css('display', 'flex');
        $listItem.find('.xofac-snippet-title-edit-input').focus();
    });

    $list.on('click', '.xofac-title-save', function(e) {
        e.preventDefault();
        const $listItem = $(this).closest('.xofac-chalkboard-item');
        const snippetId = $listItem.data('id');
        const newTitle = $listItem.find('.xofac-snippet-title-edit-input').val().trim();
        const existingText = $listItem.find('.xofac-snippet-edit-input').val(); 
        const $saveBtn = $(this);

        $saveBtn.text(xofacChalkboard.i18n.saving).prop('disabled', true);

        $.post(xofacChalkboard.ajax_url, {
            action: 'xofac_edit_snippet',
            nonce: xofacChalkboard.nonce,
            snippet_id: snippetId,
            title: newTitle,
            text: existingText
        }, function(response) {
            $saveBtn.text(xofacChalkboard.i18n.save).prop('disabled', false);
            if (response.success) {
                $listItem.find('.xofac-title-text').html(response.data.title_html);
                $listItem.find('.xofac-snippet-title-edit-container').hide();
                $listItem.find('.xofac-snippet-title-bar').css('display', 'flex');
            } else {
                alert(xofacChalkboard.i18n.errorSavingTitle);
            }
        });
    });

    // ===============================================
    // Handle snippet content editing state and saving
    // ===============================================
    $list.on('click', '.xofac-chalkboard-edit', function(e) {
        e.preventDefault();
        const $listItem = $(this).closest('.xofac-chalkboard-item');
        
        $listItem.find('.xofac-snippet-content').hide();
        $listItem.find('.xofac-snippet-edit-input').show().focus();
        $listItem.find('.xofac-snippet-actions-horizontal .xofac-action-icon').hide();
        $listItem.find('.xofac-snippet-save-wrap').css('display', 'flex'); 
        $listItem.find('.xofac-edit-color-picker').show();
    });

    $list.on('click', '.xofac-chalkboard-save', function(e) {
        e.preventDefault();
        const $listItem = $(this).closest('.xofac-chalkboard-item');
        const snippetId = $listItem.data('id');
        const existingTitle = $listItem.find('.xofac-snippet-title-edit-input').val();
        const newText = $listItem.find('.xofac-snippet-edit-input').val().trim();
        const newColor = $listItem.find('.xofac-snippet-color-edit-input').val();
        const $saveBtn = $(this);

        if (newText === '') {
            alert(xofacChalkboard.i18n.emptySnippet);
            return;
        }

        $saveBtn.text(xofacChalkboard.i18n.saving).prop('disabled', true);

        $.post(xofacChalkboard.ajax_url, {
            action: 'xofac_edit_snippet',
            nonce: xofacChalkboard.nonce,
            snippet_id: snippetId,
            title: existingTitle,
            text: newText,
            color: newColor
        }, function(response) {
            $saveBtn.text(xofacChalkboard.i18n.saveSnippet).prop('disabled', false);
            if (response.success) {
                $listItem.find('.xofac-snippet-content').html(response.data.html).show();
                $listItem.find('.xofac-snippet-edit-input').hide();
                $listItem.css('background-color', response.data.color);
                
                // Hide the new bottom wrapper instead of just the button
                $listItem.find('.xofac-snippet-save-wrap').hide();
                $listItem.find('.xofac-snippet-actions-horizontal .xofac-action-icon').show();
                $listItem.find('.xofac-edit-color-picker').hide(); 
                $listItem.find('.xofac-color-bar').hide(); 
            } else {
                alert(xofacChalkboard.i18n.errorSaving);
            }
        });
    });

    // ==========================================================
    // Initialize jQuery UI Sortable for drag-and-drop reordering
    // ==========================================================
    $list.sortable({
        handle: '.xofac-drag-handle',
        placeholder: 'xofac-sortable-placeholder',
        opacity: 0.8,
        update: function(event, ui) {
            const newOrder = [];
            
            $list.find('.xofac-chalkboard-item').each(function() {
                newOrder.push($(this).data('id'));
            });

            $.post(xofacChalkboard.ajax_url, {
                action: 'xofac_reorder_snippet',
                nonce: xofacChalkboard.nonce,
                snippet_ids: newOrder
            }, function(response) {
                if (!response.success) {
                    alert(xofacChalkboard.i18n.errorReorder);
                }
            });
        }
    });

    // =====================================
    // Handle clipboard copy API integration
    // =====================================
    $list.on('click', '.xofac-chalkboard-copy', function(e) {
        e.preventDefault();
        
        const $btn = $(this);
        const $listItem = $btn.closest('.xofac-chalkboard-item');
        const $actionsContainer = $btn.closest('.xofac-snippet-actions-horizontal');
        
        const textToCopy = $listItem.find('.xofac-snippet-edit-input').val();

        navigator.clipboard.writeText(textToCopy).then(function() {
            $actionsContainer.find('.xofac-copied-tooltip').remove();
            
            const $tooltip = $('<div class="xofac-copied-tooltip">' + xofacChalkboard.i18n.copied + '</div>');
            
            $actionsContainer.append($tooltip);
            $tooltip.fadeIn(200).delay(1500).fadeOut(300, function() {
                $(this).remove();
            });
            
        }).catch(function(err) {
            console.error('Failed to copy text: ', err);
            alert(xofacChalkboard.i18n.clipboardError);
        });
    });

    // ============================
    // Handle color picker UI state
    // ============================
    $(document).on('click', '.xofac-rainbow-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('.xofac-color-bar').not($(this).siblings('.xofac-color-bar')).hide();
        $(this).siblings('.xofac-color-bar').toggle();
    });

    $(document).on('click', '.xofac-color-swatch', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $swatch = $(this);
        const color = $swatch.data('color');
        const $container = $swatch.closest('.xofac-color-picker-container');
        
        $container.find('input[type="hidden"]').val(color);
        $swatch.parent('.xofac-color-bar').hide();

        if ($container.closest('#xofac-create-container').length) {
            $('#xofac-create-container').css('background-color', color);
        } else {
            $swatch.closest('.xofac-chalkboard-item').css('background-color', color);
        }
    });

    $(document).on('click', function(e) {
        if (!$(e.target).closest('.xofac-color-picker-container').length) {
            $('.xofac-color-bar').hide();
        }
    });

    // ========================================
    // Handle exporting snippets to a JSON file
    // ========================================
    $('#xofac-export-btn').on('click', function(e) {
        e.preventDefault();
        
        $.post(xofacChalkboard.ajax_url, {
            action: 'xofac_export_snippets',
            nonce: xofacChalkboard.nonce
        }, function(response) {
            if (response.success) {
                const blob = new Blob([response.data], { type: 'application/json' });
                const downloadUrl = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = 'xofac-chalkboard-data.json';
                document.body.appendChild(a);
                a.click();
                
                document.body.removeChild(a);
                URL.revokeObjectURL(downloadUrl);
            } else {
                alert(xofacChalkboard.i18n.errorExporting);
            }
        });
    });

    // ===========================================
    // Handle triggering the file input for import
    // ===========================================
    $('#xofac-import-btn').on('click', function(e) {
        e.preventDefault();
        $('#xofac-import-file').click(); 
    });

    // ==================================================================
    // Handle reading the selected JSON file and pushing it to the server
    // ==================================================================
    $('#xofac-import-file').on('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const fileContent = event.target.result;
            
            $.post(xofacChalkboard.ajax_url, {
                action: 'xofac_import_snippets',
                nonce: xofacChalkboard.nonce,
                import_data: fileContent
            }, function(response) {
                if (response.success) {
                    location.reload(); 
                } else {
                    alert(xofacChalkboard.i18n.errorImporting + response.data);
                }
            });
            
            $('#xofac-import-file').val('');
        };
        
        reader.readAsText(file);
    });

    // =======================================
    // Prevent data loss during active editing
    // =======================================
    $(window).on('beforeunload', function(e) {
        const isEditingText = $('.xofac-chalkboard-save:visible').length > 0;
        const isEditingTitle = $('.xofac-snippet-title-edit-container:visible').length > 0;

        if (isEditingText || isEditingTitle) {
            const warningMessage = xofacChalkboard.i18n.unsavedChanges;
            e.preventDefault(); 
            e.returnValue = warningMessage; 
            return warningMessage;
        }
    });

});