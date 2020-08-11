$(function() { 
    // show popupボタンクリック時の処理
    $('#show').click(function(e) {
        $('#popup, #container').show();
    });     
    // ポップアップのcloseボタンクリック時の処理
    $('#close, #container').click(function(e) {
        $('#popup, #container').hide();
    });     
});