/**
 * XOF Admin Chalkboard - Core JavaScript
 * 
 * @package   XOF_Admin_Chalkboard
 * @author    XOF Media
 * @copyright  2026 XOF Media
 * @license   GPL-3.0+
 * @link      https://xofmedia.com/wordpress-plugins/xof-admin-chalkboard-widget-free/
 * @version   1.0.0
 */

jQuery(document).ready(function($) {

    const $titleInput = $('#xof-chalkboard-title-input');
    const $input = $('#xof-chalkboard-input');
    const $addButton = $('#xof-chalkboard-add');
    const $spinner = $('#xof-chalkboard-spinner');
    const $colorInput = $('#xof-chalkboard-color-input');
    const $createContainer = $('#xof-create-container');
    const $list = $('#xof-chalkboard-list');

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

        $.post(xofChalkboard.ajax_url, {
            action: 'xof_add_snippet',
            nonce: xofChalkboard.nonce,
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
                    <li class="xof-chalkboard-item" data-id="${response.data.id}" style="background-color: ${response.data.color};">
                        <div class="xof-snippet-body">
                            <div class="xof-snippet-title-wrapper">
                                <div class="xof-snippet-title-bar">
                                    <div class="xof-title-toggle-wrap" title="Click to Expand/Collapse">
                                        <span class="xof-accordion-toggle"></span>
                                        <span class="xof-title-text" style="color: #ffffff;">${response.data.title_html}</span>
                                    </div>
                                    <img src="${xofChalkboard.plugin_url}images/xof_chalkboard-title-edit-button_64x.png" class="xof-title-edit-icon" title="${xofChalkboard.i18n.editTitle}" alt="${xofChalkboard.i18n.editTitle}" />
                                </div>
                                <div class="xof-snippet-title-edit-container" style="display:none;">
                                    <input type="text" class="xof-snippet-title-edit-input" value="${response.data.title_raw}" />
                                    <button type="button" class="button button-small xof-title-save">${xofChalkboard.i18n.save}</button>
                                </div>
                            </div>
                            
                            <div class="xof-snippet-collapse-wrap">
                                <div class="xof-snippet-actions-horizontal">
                                    <img src="${xofChalkboard.plugin_url}images/xof_chalkboard-copy-button_64x.png" class="xof-action-icon xof-chalkboard-copy" title="${xofChalkboard.i18n.copySnippet}" alt="${xofChalkboard.i18n.copySnippet}" />
                                    <img src="${xofChalkboard.plugin_url}images/xof_chalkboard-edit2-button_64x.png" class="xof-action-icon xof-chalkboard-edit" title="${xofChalkboard.i18n.editSnippet}" alt="${xofChalkboard.i18n.editSnippet}" />
                                </div>
                                <div class="xof-snippet-content">${response.data.html}</div>
                                <textarea class="xof-snippet-edit-input" style="display:none;">${response.data.raw}</textarea>
                                <div class="xof-snippet-save-wrap" style="display:none;">
                                    <button type="button" class="button button-primary button-small xof-chalkboard-save">${xofChalkboard.i18n.saveSnippet}</button>
                                </div>
                            </div>
                        </div>
                        <div class="xof-snippet-order-controls">
                            <div class="xof-order-controls-top">
                                <div class="xof-standard-order-icons">
                                    <img src="${xofChalkboard.plugin_url}images/xof_chalkboard-close2-button_64x.png" class="xof-order-icon xof-chalkboard-delete" title="${xofChalkboard.i18n.deleteSnippet}" alt="${xofChalkboard.i18n.deleteSnippet}" />
                                    <img src="${xofChalkboard.plugin_url}images/xof_chalkboard-drag-button_64x.png" class="xof-order-icon xof-drag-handle" title="${xofChalkboard.i18n.dragToReorder}" alt="${xofChalkboard.i18n.dragToReorder}" />
                                </div>
                                <div class="xof-delete-confirm-tooltip" style="display:none;">
                                    <span>${xofChalkboard.i18n.deleteConfirm}</span>
                                    <button type="button" class="button button-small xof-confirm-delete-yes">${xofChalkboard.i18n.yes}</button>
                                    <button type="button" class="button button-small xof-confirm-delete-no">${xofChalkboard.i18n.no}</button>
                                </div>
                            </div>
                            <div class="xof-color-picker-container xof-edit-color-picker" style="display:none;">
                                <input type="hidden" class="xof-snippet-color-edit-input" value="${response.data.color}" />
                                <img src="${xofChalkboard.plugin_url}images/xof_chalkboard-rainbow-button_64x.png" class="xof-action-icon xof-rainbow-btn" title="${xofChalkboard.i18n.chooseColor}" alt="${xofChalkboard.i18n.chooseColor}" />
                                <div class="xof-color-bar" style="display:none;">
                                    <div class="xof-color-swatch" data-color="#fcfcfc" style="background-color: #e0e0e0;" title="${xofChalkboard.i18n.colorDefault}"></div>
                                    <div class="xof-color-swatch" data-color="#ffe5e5" style="background-color: #ff9999;" title="${xofChalkboard.i18n.colorLightRed}"></div>
                                    <div class="xof-color-swatch" data-color="#ffebd6" style="background-color: #ffb366;" title="${xofChalkboard.i18n.colorLightOrange}"></div>
                                    <div class="xof-color-swatch" data-color="#fffae6" style="background-color: #ffe680;" title="${xofChalkboard.i18n.colorLightYellow}"></div>
                                    <div class="xof-color-swatch" data-color="#e8f5e9" style="background-color: #99cc99;" title="${xofChalkboard.i18n.colorLightGreen}"></div>
                                    <div class="xof-color-swatch" data-color="#e3f2fd" style="background-color: #99c2ff;" title="${xofChalkboard.i18n.colorLightBlue}"></div>
                                    <div class="xof-color-swatch" data-color="#f3e5f5" style="background-color: #cc99ff;" title="${xofChalkboard.i18n.colorLightPurple}"></div>
                                </div>
                            </div>
                        </div>
                    </li>
                `;
                
                $list.prepend(newListItem);
            } else {
                alert(xofChalkboard.i18n.errorAdding + response.data);
            }
        });
    });

    // ===================================
    // Handle deletion UI and confirmation
    // ===================================
    $list.on('click', '.xof-chalkboard-delete', function(e) {
        e.preventDefault();
        const $topControls = $(this).closest('.xof-order-controls-top');
        
        $topControls.find('.xof-standard-order-icons').hide();
        $topControls.find('.xof-delete-confirm-tooltip').show();
    });

    $list.on('click', '.xof-confirm-delete-no', function(e) {
        e.preventDefault();
        const $topControls = $(this).closest('.xof-order-controls-top');
        
        $topControls.find('.xof-delete-confirm-tooltip').hide();
        $topControls.find('.xof-standard-order-icons').show();
    });

    $list.on('click', '.xof-confirm-delete-yes', function(e) {
        e.preventDefault();
        
        const $listItem = $(this).closest('.xof-chalkboard-item');
        const snippetId = $listItem.data('id');
        
        $listItem.css('opacity', '0.5');

        $.post(xofChalkboard.ajax_url, {
            action: 'xof_delete_snippet',
            nonce: xofChalkboard.nonce,
            snippet_id: snippetId
        }, function(response) {
            if (response.success) {
                $listItem.slideUp(300, function() {
                    $(this).remove();
                });
            } else {
                $listItem.css('opacity', '1');
                alert(xofChalkboard.i18n.errorDeleting);
                
                const $topControls = $listItem.find('.xof-order-controls-top');
                $topControls.find('.xof-delete-confirm-tooltip').hide();
                $topControls.find('.xof-standard-order-icons').show();
            }
        });
    });

    // =============================================
    // Handle accordion expand and collapse behavior
    // =============================================
    $list.on('click', '.xof-title-toggle-wrap', function(e) {
        e.preventDefault();
        const $item = $(this).closest('.xof-chalkboard-item');
        const $collapseWrap = $item.find('.xof-snippet-collapse-wrap');
        
        $collapseWrap.slideToggle(250, function() {
            $item.toggleClass('xof-is-collapsed');
        });
    });

    // =====================================
    // Handle title editing state and saving
    // =====================================
    $list.on('click', '.xof-title-edit-icon', function(e) {
        e.preventDefault();
        const $listItem = $(this).closest('.xof-chalkboard-item');
        
        $listItem.find('.xof-snippet-title-bar').hide();
        $listItem.find('.xof-snippet-title-edit-container').css('display', 'flex');
        $listItem.find('.xof-snippet-title-edit-input').focus();
    });

    $list.on('click', '.xof-title-save', function(e) {
        e.preventDefault();
        const $listItem = $(this).closest('.xof-chalkboard-item');
        const snippetId = $listItem.data('id');
        const newTitle = $listItem.find('.xof-snippet-title-edit-input').val().trim();
        const existingText = $listItem.find('.xof-snippet-edit-input').val(); 
        const $saveBtn = $(this);

        $saveBtn.text(xofChalkboard.i18n.saving).prop('disabled', true);

        $.post(xofChalkboard.ajax_url, {
            action: 'xof_edit_snippet',
            nonce: xofChalkboard.nonce,
            snippet_id: snippetId,
            title: newTitle,
            text: existingText
        }, function(response) {
            $saveBtn.text(xofChalkboard.i18n.save).prop('disabled', false);
            if (response.success) {
                $listItem.find('.xof-title-text').html(response.data.title_html);
                $listItem.find('.xof-snippet-title-edit-container').hide();
                $listItem.find('.xof-snippet-title-bar').css('display', 'flex');
            } else {
                alert(xofChalkboard.i18n.errorSavingTitle);
            }
        });
    });

    // ===============================================
    // Handle snippet content editing state and saving
    // ===============================================
    $list.on('click', '.xof-chalkboard-edit', function(e) {
        e.preventDefault();
        const $listItem = $(this).closest('.xof-chalkboard-item');
        
        $listItem.find('.xof-snippet-content').hide();
        $listItem.find('.xof-snippet-edit-input').show().focus();
        $listItem.find('.xof-snippet-actions-horizontal .xof-action-icon').hide();
        $listItem.find('.xof-snippet-save-wrap').css('display', 'flex'); 
        $listItem.find('.xof-edit-color-picker').show();
    });

    $list.on('click', '.xof-chalkboard-save', function(e) {
        e.preventDefault();
        const $listItem = $(this).closest('.xof-chalkboard-item');
        const snippetId = $listItem.data('id');
        const existingTitle = $listItem.find('.xof-snippet-title-edit-input').val();
        const newText = $listItem.find('.xof-snippet-edit-input').val().trim();
        const newColor = $listItem.find('.xof-snippet-color-edit-input').val();
        const $saveBtn = $(this);

        if (newText === '') {
            alert(xofChalkboard.i18n.emptySnippet);
            return;
        }

        $saveBtn.text(xofChalkboard.i18n.saving).prop('disabled', true);

        $.post(xofChalkboard.ajax_url, {
            action: 'xof_edit_snippet',
            nonce: xofChalkboard.nonce,
            snippet_id: snippetId,
            title: existingTitle,
            text: newText,
            color: newColor
        }, function(response) {
            $saveBtn.text(xofChalkboard.i18n.saveSnippet).prop('disabled', false);
            if (response.success) {
                $listItem.find('.xof-snippet-content').html(response.data.html).show();
                $listItem.find('.xof-snippet-edit-input').hide();
                $listItem.css('background-color', response.data.color);
                
                // Hide the new bottom wrapper instead of just the button
                $listItem.find('.xof-snippet-save-wrap').hide();
                $listItem.find('.xof-snippet-actions-horizontal .xof-action-icon').show();
                $listItem.find('.xof-edit-color-picker').hide(); 
                $listItem.find('.xof-color-bar').hide(); 
            } else {
                alert(xofChalkboard.i18n.errorSaving);
            }
        });
    });

    // ==========================================================
    // Initialize jQuery UI Sortable for drag-and-drop reordering
    // ==========================================================
    $list.sortable({
        handle: '.xof-drag-handle',
        placeholder: 'xof-sortable-placeholder',
        opacity: 0.8,
        update: function(event, ui) {
            const newOrder = [];
            
            $list.find('.xof-chalkboard-item').each(function() {
                newOrder.push($(this).data('id'));
            });

            $.post(xofChalkboard.ajax_url, {
                action: 'xof_reorder_snippet',
                nonce: xofChalkboard.nonce,
                snippet_ids: newOrder
            }, function(response) {
                if (!response.success) {
                    alert(xofChalkboard.i18n.errorReorder);
                }
            });
        }
    });

    // =====================================
    // Handle clipboard copy API integration
    // =====================================
    $list.on('click', '.xof-chalkboard-copy', function(e) {
        e.preventDefault();
        
        const $btn = $(this);
        const $listItem = $btn.closest('.xof-chalkboard-item');
        const $actionsContainer = $btn.closest('.xof-snippet-actions-horizontal');
        
        const textToCopy = $listItem.find('.xof-snippet-edit-input').val();

        navigator.clipboard.writeText(textToCopy).then(function() {
            $actionsContainer.find('.xof-copied-tooltip').remove();
            
            const $tooltip = $('<div class="xof-copied-tooltip">' + xofChalkboard.i18n.copied + '</div>');
            
            $actionsContainer.append($tooltip);
            $tooltip.fadeIn(200).delay(1500).fadeOut(300, function() {
                $(this).remove();
            });
            
        }).catch(function(err) {
            console.error('Failed to copy text: ', err);
            alert(xofChalkboard.i18n.clipboardError);
        });
    });

    // ============================
    // Handle color picker UI state
    // ============================
    $(document).on('click', '.xof-rainbow-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('.xof-color-bar').not($(this).siblings('.xof-color-bar')).hide();
        $(this).siblings('.xof-color-bar').toggle();
    });

    $(document).on('click', '.xof-color-swatch', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $swatch = $(this);
        const color = $swatch.data('color');
        const $container = $swatch.closest('.xof-color-picker-container');
        
        $container.find('input[type="hidden"]').val(color);
        $swatch.parent('.xof-color-bar').hide();

        if ($container.closest('#xof-create-container').length) {
            $('#xof-create-container').css('background-color', color);
        } else {
            $swatch.closest('.xof-chalkboard-item').css('background-color', color);
        }
    });

    $(document).on('click', function(e) {
        if (!$(e.target).closest('.xof-color-picker-container').length) {
            $('.xof-color-bar').hide();
        }
    });

    // ========================================
    // Handle exporting snippets to a JSON file
    // ========================================
    $('#xof-export-btn').on('click', function(e) {
        e.preventDefault();
        
        $.post(xofChalkboard.ajax_url, {
            action: 'xof_export_snippets',
            nonce: xofChalkboard.nonce
        }, function(response) {
            if (response.success) {
                const blob = new Blob([response.data], { type: 'application/json' });
                const downloadUrl = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = 'xof-chalkboard-data.json';
                document.body.appendChild(a);
                a.click();
                
                document.body.removeChild(a);
                URL.revokeObjectURL(downloadUrl);
            } else {
                alert(xofChalkboard.i18n.errorExporting);
            }
        });
    });

    // ===========================================
    // Handle triggering the file input for import
    // ===========================================
    $('#xof-import-btn').on('click', function(e) {
        e.preventDefault();
        $('#xof-import-file').click(); 
    });

    // ==================================================================
    // Handle reading the selected JSON file and pushing it to the server
    // ==================================================================
    $('#xof-import-file').on('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const fileContent = event.target.result;
            
            $.post(xofChalkboard.ajax_url, {
                action: 'xof_import_snippets',
                nonce: xofChalkboard.nonce,
                import_data: fileContent
            }, function(response) {
                if (response.success) {
                    location.reload(); 
                } else {
                    alert(xofChalkboard.i18n.errorImporting + response.data);
                }
            });
            
            $('#xof-import-file').val('');
        };
        
        reader.readAsText(file);
    });

    // =======================================
    // Prevent data loss during active editing
    // =======================================
    $(window).on('beforeunload', function(e) {
        const isEditingText = $('.xof-chalkboard-save:visible').length > 0;
        const isEditingTitle = $('.xof-snippet-title-edit-container:visible').length > 0;

        if (isEditingText || isEditingTitle) {
            const warningMessage = xofChalkboard.i18n.unsavedChanges;
            e.preventDefault(); 
            e.returnValue = warningMessage; 
            return warningMessage;
        }
    });

});