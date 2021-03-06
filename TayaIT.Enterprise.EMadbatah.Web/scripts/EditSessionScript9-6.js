﻿// validation
function check() {
    var x = document.forms.editSessionFileForm
    x[0].checked = true
}

function uncheck() {
    var x = document.forms.editSessionFileForm
    x[0].checked = false
}
var prevAgendaItemIndex;
var prevAgendaSubItemIndex;
var prevSpeakerIndex;
var prevSpeakerTitle;
var prevFragOrder;
var prevSpeakerJob;
var prevSpeakerImgUrl;



$(document).ready(function() {
 // select tag
    var $MainContent_ddlSpeakers = $('#MainContent_ddlSpeakers').select2().trigger("change");
    // vars
    var startTime = $('.hdstartTime');
    var endTime = $('.hdendTime');
    var currentOrder = $('.hdcurrentOrder');
    //all choosable items
    var allInputs = $("#MainContent_ddlAgendaItems,#MainContent_ddlAgendaSubItems,#MainContent_ddlSpeakers,#MainContent_txtSpeakerOtherJob,#specialBranch,#MainContent_ddlOtherTitles,#MainContent_ddlCommittee")
        // validate form onsubmit
    var formvalidation = $("#editSessionFileForm").validate({
        onclick: false,
        errorPlacement: function(error, element) {
            if (element.attr('id') == 'txtAgendaItem') {
                element.next().next('.errorCont').html(error)
            } else if (element.attr('id') == 'MainContent_ddlSpeakers') {
               // element.after(error);
                alert(error.html());
            }
            else{
                element.after(error);
            }
        },
	      
        rules: {
            addnewjobtext: "required",
            ctl00$MainContent$ddlAgendaItems: {
                required: true,
                min: 1
            },
            ctl00$MainContent$ddlSpeakers: {
                required: true,
                min: 1
            },
            txtAgendaItem: {
                required: "#specialBranch:checked"
            }
        },
        messages: {
            addnewjobtext: "أدخل وظيفة المتحدث",
            ctl00$MainContent$ddlAgendaItems: "من فضلك اختر البند",
            ctl00$MainContent$ddlSpeakers: "من فضلك اختر المتحدث",
            txtAgendaItem: "ادخل اسم البند الأستثنائى"

        }
    });
    // remove checkbox selection
    $(".sameAsPrevSpeaker").selected(false);
    $(".chkIgnoredSegment").selected(false);

    //usama march
    //$(".chkGroupSubAgendaItems").selected(false);

    // for the popup window
    var resetText = $("#various1");
    resetText.fancybox({
        titlePosition: 'inside',
        transitionIn: 'none',
        transitionOut: 'none',
        autoDimensions: false,
        padding: 20,
        width: 600,
        height: 120,
        href: resetText.attr('data-div')
    });
    // popup buttons actions
    $('#yes').click(function() {
        var ed = $('#MainContent_elm1').tinymce();
        var sessionContentItemID = getParameterByName("scid");
        var sessionFileID = getParameterByName("sfid");
        // Do you ajax call here, window.setTimeout fakes ajax call
        ed.setProgressState(1); // Show progress
        jQuery.ajax({
            cache: false,
            type: 'post',
            url: 'EditSessionHandler.ashx',
            data: {
                funcname: 'BackToOriginalContent',
                sfid: sessionFileID,
                scid: sessionContentItemID
            },
            dataType: 'json',
            success: function(response) {
                if (response != '') {
                    ed.setProgressState(0); // Hide progress
                    //ed.setContent(html);
                    if (response.Message == "success") {
                        $("#MainContent_elm1").val(response.Item.Text);
                        $("#MainContent_CurrentItemID").val(response.FragOrderInXml);
                    } else {
                        alert("عفواً . غير مسموح لك بالتعديل في هذه الصفحة");

                    }
                }
            },
            error: function() {

            }
        });
        // close popup
        $.fancybox.close()
    })
    $('#no').click(function() {
        $.fancybox.close()
    })

    //onchange ignored
    $('.chkIgnoredSegment').change(function() {

            if($(this).attr('checked'))
            {
                var selectedSpeakerID = $("#MainContent_ddlSpeakers").val();
                if(selectedSpeakerID == 0)
                {
                    $("#MainContent_ddlSpeakers option:contains(" + "غير محدد" + ")").attr('selected', 'selected');
                    $("#select2-MainContent_ddlSpeakers-container").html($('#MainContent_ddlSpeakers :selected').text());
                }
            }
    });

    // onchange event for SameSpeaker checkbox
    $('.sameAsPrevSpeaker').change(function() {
        if ($(".sameAsPrevSpeaker").is(':checked')) {
            //$("#editSessionFileForm").resetForm()
            $("#MainContent_ddlAgendaItems").val(prevAgendaItemIndex);
            $('#MainContent_ddlAgendaItems').trigger('change');
            $("#MainContent_ddlAgendaSubItems").val(prevAgendaSubItemIndex);
            $("#MainContent_ddlSpeakers").val(prevSpeakerIndex).trigger("change");
            $("#MainContent_txtSpeakerOtherJob").val(prevSpeakerTitle);
            $("#MainContent_imgSpeakerAvatar").attr("src",prevSpeakerImgUrl);
            $("#MainContent_txtSpeakerJob").html(prevSpeakerJob);
            allInputs.attr('disabled', 'disabled');
            // remove all errors
            $('label.error').remove()
            $('.error').removeClass('error')
        } else {
            allInputs.removeAttr('disabled', 'disabled');

            if ($(".chkGroupSubAgendaItems").is(':checked')) {
                $("#MainContent_ddlAgendaSubItems").attr('disabled', 'disabled');
            } else {
                $("#MainContent_ddlAgendaSubItems").removeAttr('disabled', 'disabled');
            }
            $("#MainContent_ddlSpeakers").val(0).trigger("change");
            $("#select2-MainContent_ddlSpeakers-container").html($('#MainContent_ddlSpeakers :selected').text());
            $("#MainContent_ddlOtherTitles").val(0);
            $("#MainContent_ddlCommittee").val(0).hide();
            $("#MainContent_txtSpeakerOtherJob").val("");
            $("#MainContent_imgSpeakerAvatar").attr("src","/images/AttendantAvatars/unknown.jpg");
        }
    });

    //usama march
    // onchange event for SameSpeaker checkbox
    $('.chkGroupSubAgendaItems').change(function() {
        if ($(".chkGroupSubAgendaItems").is(':checked')) {
            $("#MainContent_ddlAgendaSubItems").attr('disabled', 'disabled');
            $("#MainContent_ddlAgendaItems > option:selected").attr("IsGroupSubAgendaItems", "true");
        } else {
            $("#MainContent_ddlAgendaSubItems").removeAttr('disabled', 'disabled');
            $("#MainContent_ddlAgendaItems > option:selected").attr("IsGroupSubAgendaItems", "false");
        }
    });


    // cascading drop down lists, to get AgendaSubItems By AgendaItem ID
    $("#MainContent_ddlAgendaItems").change(function() {
        $("#MainContent_ddlAgendaSubItems").html("");
        var AgendaItemID = $("#MainContent_ddlAgendaItems > option:selected").attr("value");

        var IsGroupSubAgendaItems = $("#MainContent_ddlAgendaItems > option:selected").attr("IsGroupSubAgendaItems");

        if (AgendaItemID <= 0) {
            $('#specialBranch').attr('disabled', 'disabled');
            $('select#MainContent_ddlAgendaSubItems').attr('disabled', 'disabled')
        } else {
            $('#specialBranch').removeAttr('disabled');
            $('select#MainContent_ddlAgendaSubItems').removeAttr('disabled');
        }

        if (AgendaItemID != 0) {
            $('select#MainContent_ddlAgendaSubItems').attr('disabled', 'disabled')
            jQuery.ajax({
                cache: false,
                type: 'post',
                url: 'EditSessionHandler.ashx',
                data: {
                    funcname: 'GetAgendaSubItems',
                    agendaid: AgendaItemID
                },
                //contentType: "application/json; charset=utf-8",
                dataType: 'json',
                success: function(subitems) {
                    $.each(subitems, function() {
                        $("#MainContent_ddlAgendaSubItems").append($("<option></option>").val(this['ID']).html(this['Text']));
                    });
                    if (subitems.length > 0) {
                        $('select#MainContent_ddlAgendaSubItems').removeAttr('disabled')
                    }

                    if (IsGroupSubAgendaItems == 'true') {
                        $('select#MainContent_ddlAgendaSubItems').attr('disabled', 'disabled');
                        $(".chkGroupSubAgendaItems").attr("checked", "checked");
                    } else {
                        $(".chkGroupSubAgendaItems").removeAttr("checked");
                    }

                    if ($(".sameAsPrevSpeaker").is(':checked')) {
                        $('select#MainContent_ddlAgendaSubItems').attr('disabled', 'disabled').val(prevAgendaSubItemIndex);
                    }

                },
                error: function() {

                }
            });
        }
    });



    $("#MainContent_ddlSpeakers").change(function() {
        $('#divNewSpeaker').hide("");
        var attendantID = $("#MainContent_ddlSpeakers").val();
        $("#MainContent_ddlSpeakers").removeClass("error");
        if (attendantID != 0 && attendantID != "1.5") {
            // $('select#MainContent_ddlAgendaSubItems').attr('disabled', 'disabled')
            jQuery.ajax({
                cache: false,
                type: 'post',
                url: 'EditSessionHandler.ashx',
                data: {
                    funcname: 'GetSpeakerJobTitleAndAvatar',
                    attid: attendantID
                },
                //contentType: "application/json; charset=utf-8",
                dataType: 'json',
                success: function(data) {
                    if (data != 'error') {
                       var d = new Date();
                        var n = d.getTime(); 
                        var dataArr = data.split(",");
                        $('#MainContent_txtSpeakerJob').html(dataArr[0]);
                        $('#MainContent_imgSpeakerAvatar').attr("src","/images/AttendantAvatars/" + dataArr[1]+"?" + n.toString());
                        $('#MainContent_ddlOtherTitles').val(0).removeAttr('disabled', 'disabled');
                        $('#MainContent_ddlCommittee').val(0).hide().removeAttr('disabled', 'disabled');
                        $('#MainContent_txtSpeakerOtherJob').val("").removeAttr('disabled', 'disabled');
						if($("#MainContent_ddlSpeakers > option:selected").text() == "غير محدد"){
						    $('#MainContent_ddlOtherTitles').val(0).attr('disabled', 'disabled');
                            $('#MainContent_ddlCommittee').val(0).hide().attr('disabled', 'disabled');
                            $('#MainContent_txtSpeakerOtherJob').val("").attr('disabled', 'disabled');
						}
                    }
                }

            });
        }else{
          $('#MainContent_txtSpeakerJob').html("");
          $('#MainContent_imgSpeakerAvatar').attr("src","/images/AttendantAvatars/unknown.jpg");
          $('#MainContent_ddlOtherTitles').val(0).removeAttr('disabled', 'disabled');
          $('#MainContent_ddlCommittee').val(0).hide().removeAttr('disabled', 'disabled');
          $('#MainContent_txtSpeakerOtherJob').val("").removeAttr('disabled', 'disabled');
          if(attendantID == "1.5")
          {
             $('#divNewSpeaker').show("");
          }
          else{
             $('#divNewSpeaker').hide("");
          }
        }
    });


    // next button onclick
    $(".next").click(function() {
        if ($("#editSessionFileForm").valid()) {
            $(".next").attr("disabled", "disabled");
            // var AgendaItemID = $("#MainContent_ddlAgendaItems > option:selected").length > 0 ? $("#MainContent_ddlAgendaItems > option:selected").attr("value") : "";
            //  var AgendaSubItemID = $("#MainContent_ddlAgendaSubItems > option:selected").length > 0 ? $("#MainContent_ddlAgendaSubItems > option:selected").attr("value") : "";
            var AgendaItemID = $('.agendaItemId').val();
            var AttachID = $('.attachId').val();
            var VoteID = $('.voteId').val();
            var SpeakerID = $("#MainContent_ddlSpeakers").val();
            SpeakerID = SpeakerID == 1.5 ? -1 : SpeakerID;
            var SpeakerName = $(".txtNewSpeaker").val();
            var SameAsPrevSpeaker = $(".sameAsPrevSpeaker").is(':checked');
            var IsSessionPresident = $(".isSessionPresident").is(':checked') ? "1" : "0";
            var IsGroupSubAgendaItems = $(".chkGroupSubAgendaItems").is(':checked');
            var Ignored = $(".chkIgnoredSegment").is(':checked');
            var SpeakerJob = $("#MainContent_txtSpeakerOtherJob").val();
            var SpeakerImgUrl = $("#MainContent_imgSpeakerAvatar").attr("src");
            // editor value
            var clone = $('<div>').append($("#MainContent_elm1").val());
            clone.find('span').removeClass('highlight editable hover');
            var Text = encodeURI(clone.html())
            // comments value
            var Comments = $("#MainContent_txtComments").val();
            var Footer = $("#MainContent_txtFooter").val();
            // Show progress
            var ed = $('#MainContent_elm1').tinymce()
            ed.setProgressState(1);
            $(".addingNewAgendaItem").show();
            // pause the player
            $("#jquery_jplayer_1").jPlayer("pause");
            //
            if (currentOrder.val() - 0 > prevFragOrder - 0) {
                if (SameAsPrevSpeaker == false &&
                    prevSpeakerIndex == SpeakerID) {
                    if (confirm('لقد اخترت نفس بيانات المتحدث السابق، هل تريد دمج هذا النص مع سابقه ؟')) {

                        $(".sameAsPrevSpeaker").attr('checked', 'checked');
                        allInputs.attr('disabled', 'disabled');
                        SameAsPrevSpeaker = true;
                    } else {
                        $("#MainContent_ddlSpeakers").val(0).trigger("change");
                        $("#select2-MainContent_ddlSpeakers-container").html($('#MainContent_ddlSpeakers :selected').text());
                        allInputs.removeAttr('disabled');
                        ed.setProgressState(0);
                        $(".next").removeAttr("disabled");
                        return;
                    }
                }
            }
            if (AgendaItemID != 0) {
                jQuery.ajax({
                    cache: false,
                    type: 'post',
                    url: 'EditSessionHandler.ashx',
                    data: {
                        funcname: 'DoNext',
                        AgendaItemID: AgendaItemID,
                        AttachID: AttachID,
                        VoteID: VoteID,
                        SpeakerID: SpeakerID,
                        SpeakerName: SpeakerName,
                        SameAsPrevSpeaker: SameAsPrevSpeaker,
                        IsSessionPresident: IsSessionPresident,
                        IsGroupSubAgendaItems: IsGroupSubAgendaItems,
                        Ignored: Ignored,
                        SpeakerJob: SpeakerJob,
                        Text: Text,
                        Comments: Comments,
                        Footer: Footer
                    },
                    dataType: 'json',
                    success: function (response) {
                        prevAgendaItemIndex = AgendaItemID;
                        prevSpeakerIndex = SpeakerID;
                        prevSpeakerTitle = SpeakerJob;
                        prevSpeakerImgUrl = SpeakerImgUrl;
                        prevSpeakerJob = $("#MainContent_txtSpeakerJob").html();
                        prevFragOrder = currentOrder.val();
                        BindData(response,1);
                        nextAndprev({
                            ed: ed,
                            response: response
                        })
                        //

                    },
                    error: function () {
                        alert("لقد حدث خطأ");

                        $(".next").removeAttr("disabled");
                        ed.setProgressState(0);
                        allInputs.removeAttr('disabled');
                    }
                });
            }
        }
    });

    function htmlEncode(value) {
        return $('<div/>').text(value).html();
    }
 
    $(".split").click(function () {
        // VARS
        var ed = $('#MainContent_elm1').tinymce();
        // clean up
        ed.execCommand('mceCleanup');
        // check if the user selected the whole text
        if (
            ed.selection.getContent().length ||
            (ed.contentDocument.body.firstChild == ed.contentDocument.body.lastChild) ||
            (ed.contentDocument.body.firstChild == ed.selection.getStart() && ed.contentDocument.body.lastChild == ed.selection.getEnd())
        ){
            // alert the user
            alert('You selected the whole text');
            return;
        }
        // select where the cursor is
        var range = ed.selection.getRng();
        var rangeStart = ed.selection.getNode();
        // check if the start not the body
        if (rangeStart.nodeName == 'BODY') {
            // insert mark where the mouse
            ed.execCommand('mceInsertRawHTML', false,'<i id="mark"></i>');
            // get the mark
            var $mark = $(ed.getBody()).find('#mark');
            // get the nearest
	        rangeStart = $mark.next();
	        // get the nearest
	        if(!rangeStart.length){
		        rangeStart = $mark.prev();
	        }
	        // get the dom
	        if(rangeStart){
		        rangeStart = rangeStart[0];
	        }
            // remove mark
            $mark.remove();
        }
        var $rangeStart = $(rangeStart);
        // remove classes
        $rangeStart.removeClass('highlight editable hover');

        // check if the element is block element or not
        var isBlock = ed.dom.isBlock(rangeStart);
        // if block element select it
        if (isBlock) {
            var lastElement = $rangeStart.nextAll().andSelf().last();
            range.setStart(rangeStart, 0);
            range.setEnd(lastElement[0], 1);
            ed.selection.setRng(range);
        }else if(rangeStart.nodeName == 'SPAN') {
            // Check if there is more than one word
            var words = $rangeStart.html().split(' ').filter(function(n){ return n != ''});
            var wordsLength = words.length;
            // check if he in the end of teh selection or not
            if(range.startOffset == 1 && rangeStart.nextSibling.nodeName == '#text'){
                rangeStart = rangeStart.nextSibling;
                $rangeStart = $(rangeStart);
            }
            if(wordsLength == 1){
                var lastElement = $rangeStart.nextAll().andSelf().last();
                range.setStart(rangeStart, 0);
                range.setEnd(lastElement[0], 1);
                ed.selection.setRng(range);
            }else{
                // CHECK THE SELECTION START
                var selectedWords = [];
                var selectedWordsLength = 0;
                for(var index=0; index < wordsLength; index++){
                    // vars
                    selectedWordsLength += words[index].length + 1;
                    // check teh selected words
                    if(selectedWordsLength > range.startOffset+1){
                        selectedWords.push(words[index]);
                    }
                }
                // remove the words
                $rangeStart.html($rangeStart.html().replace(selectedWords.join(' '),''));
                // add the new words in new span
                var newSpanContent = (selectedWords.length == 1) ? ' '+selectedWords.join(' ') : selectedWords.join(' ')+' ';
                var $newSpan = $rangeStart.clone(false).html(newSpanContent);
                $rangeStart.after($newSpan);
                // select
                var lastElement = $newSpan.nextAll().andSelf().last();
                range.setStart($newSpan[0], 0);
                range.setEnd(lastElement[0], 1);
                ed.selection.setRng(range);
                // check if there is no text
                if($rangeStart.text().trim() == ''){
                    $rangeStart.remove();
                }
            }
        }
        // check if the user selected the whole text
        if (
            ed.contentDocument.body.firstChild == ed.selection.getStart() && ed.contentDocument.body.lastChild == ed.selection.getEnd()
        ){
            // alert the user
            alert('You selected the whole text');
            // deselect
            ed.selection.collapse(true);
            return;
        }
        // get the selection and split
        var selectedContent = ed.selection.getContent();
        // check if there is any tag
        if(!$(selectedContent).length){
            var cloneRangeStart = $rangeStart.clone().html(selectedContent);
            selectedContent = cloneRangeStart[0].outerHTML;
        }
        // split action
        splitAction(selectedContent);
    });

    $(".close_btn").click(function() {
        $(".popupoverlay").hide();
        $(".reviewpopup_cont").hide();
        $(".reviewpopup_cont-st1").hide();
    });

    $(".approve1").click(function() {
        if ($("textarea.splittinymce", '.reviewpopup_cont1').val() == '') {
            alert("لا يمكن القطع إلا بوجود نص");

            $(".popupoverlay").hide();
            $(".reviewpopup_cont1").hide();
            return;
        }
        splitAction($("textarea.splittinymce", '.reviewpopup_cont1').val());
    });

    $(".ddlOtherTitles").change(function() {
        var selectID = $(".ddlOtherTitles option:selected").attr("value");
        if( selectID == "5" || selectID == "6")
        {
        $(".ddlCommittee").show().val(0);
        }
        else{
        $(".ddlCommittee").hide();
        }

        if(selectID != "0" && selectID != "4" && selectID != "7" && selectID != "8")
        {
        $(".txtSpeakerOtherJob").val($(".ddlOtherTitles option:selected").text());
        }
        else{
          $(".txtSpeakerOtherJob").val("");
        }
     });

     $(".ddlCommittee").change(function() {
         var selecText = $("#MainContent_ddlOtherTitles  option:selected").text() + " " + $(".ddlCommittee option:selected").text();
         $(".txtSpeakerOtherJob").val(selecText);
     });


    // split function
    function splitAction(selectedHtml){
      //  if (confirm("هل أنت متأكد من أنك تريد قطع النص الحالي؟ .. هذه الخطوة لا يمكن الرجوع فيها")) {

            // cut
            tinyMCE.execCommand('mceReplaceContent',false,'');
            // vars
            var currentFileID = getParameterByName("sfid");
            // call the ajax call
            jQuery.ajax({
                cache: false,
                type: 'post',
                url: 'EditSessionHandler.ashx',
                data: {
                    funcname: 'SplitItem',
                    FRAGORDER: $(".hdcurrentOrder").val(),
                    XMLPATH: $(".hdxmlFilePath").val(),
                    SPLITTEDTEXT: htmlEncode(selectedHtml),
                    sfid: currentFileID,
                },
                dataType: 'json',
                success: function(response) {
                    // next action
                    $(".next").removeAttr("disabled").triggerHandler('click');
                },
                error: function() {
                    alert("لقد حدث خطأ");

                    ed.setProgressState(0);
                    $(".prev").removeAttr("disabled");
                }
            });
            $(".popupoverlay").hide();
            $(".reviewpopup_cont1").hide();
      //  }
    }

    // previous button onclick
    $(".prev").click(function() {
        //if ($("#editSessionFileForm").valid()) {
            $(".prev").attr("disabled", "disabled");
            var PrevContentID = $("#MainContent_CurrentItemID").val() != "0" ? $("#MainContent_CurrentItemID").val() : "";
            // var AgendaItemID = $("#MainContent_ddlAgendaItems > option:selected").length > 0 ? $("#MainContent_ddlAgendaItems > option:selected").attr("value") : "";
            //var AgendaSubItemID = $("#MainContent_ddlAgendaSubItems > option:selected").length > 0 ? $("#MainContent_ddlAgendaSubItems > option:selected").attr("value") : "";
            var AgendaItemID = $('.agendaItemId').val();
            var AttachID = $('.attachId').val();
            var VoteID = $('.voteId').val();
            var SpeakerID = $("#MainContent_ddlSpeakers").val();
            SpeakerID = SpeakerID == 0 ?  $("#MainContent_ddlSpeakers option:contains(" + "غير محدد" + ")").attr('selected', 'selected').val() : SpeakerID;
            SpeakerID = SpeakerID == 1.5 ? -1 : SpeakerID;
            var SpeakerName = $("#MainContent_txtNewSpeaker").val();
            var IsSessionPresident = $(".isSessionPresident").is(':checked') ? "1" : "0";
            var SameAsPrevSpeaker = $(".sameAsPrevSpeaker").is(':checked');
            var IsGroupSubAgendaItems = $(".chkGroupSubAgendaItems").is(':checked');
            var Ignored = $(".chkIgnoredSegment").is(':checked');
            var SpeakerJob = $("#MainContent_txtSpeakerOtherJob").val();
            // editor value
            var clone = $('<div>').append($("#MainContent_elm1").attr("value"))
            clone.find('span').removeClass('highlight editable hover')
            var Text = encodeURI(clone.html())
                // comments value
            var Comments = $("#MainContent_txtComments").val();
            var Footer = $("#MainContent_txtFooter").val();
            $(".addingNewAgendaItem").show();

            // Show progress
            var ed = $('#MainContent_elm1').tinymce()
            ed.setProgressState(1);
            // pause the player
            $("#jquery_jplayer_1").jPlayer("pause");
            //
            jQuery.ajax({
                cache: false,
                type: 'post',
                url: 'EditSessionHandler.ashx',
                data: {
                    funcname: 'DoPrevious',
                    PrevContentID: PrevContentID,
                    AgendaItemID: AgendaItemID,
                    AttachID: AttachID,
                    VoteID: VoteID,
                    // AgendaSubItemID: AgendaSubItemID,
                    SpeakerID: SpeakerID,
                    SpeakerName: SpeakerName,
                    SameAsPrevSpeaker: SameAsPrevSpeaker,
                    IsSessionPresident: IsSessionPresident,
                    IsGroupSubAgendaItems: IsGroupSubAgendaItems,
                    Ignored: Ignored,
                    SpeakerJob: SpeakerJob,
                    Text: Text,
                    Comments: Comments,
                    Footer: Footer
                },
                dataType: 'json',
                success: function(response) {
                    prevAgendaItemIndex = response.prevAgendaItemID; // Item.AgendaItemID;
                    //prevAgendaSubItemIndex = response.prevAgendaSubItemID; // Item.AgendaSubItemID;
                    prevSpeakerIndex = response.prevAttendantID; // Item.AttendantID;
                    prevSpeakerTitle = response.prevAttendantJobTitle; // Item.CommentOnAttendant;
                    prevSpeakerImgUrl = response.AttendantAvatar;
                    prevSpeakerJob = response.AttendantJobTitle;
                    BindData(response,2);
                        //prev clicked and no prev content item exist in db
                    if (response.prevAgendaItemID == null)
                        $('.sameAsPrevSpeaker').attr('disabled', 'disabled');
                    nextAndprev({
                        ed: ed,
                        response: response
                    })
                },
                error: function() {
                    alert("لقد حدث خطأ");

                    ed.setProgressState(0);
                    $(".prev").removeAttr("disabled");
                }
            });
      //  }
    });

    function nextAndprev(o) {
   
        // remove the loading
        o.ed.setProgressState(0)
            // remove undo level
        o.ed.undoManager.clear();
        o.ed.undoManager.add();
        var AudioPlayer = $("#jquery_jplayer_1");
        // pause player
        AudioPlayer.jPlayer("stop").jPlayer("play");
       // $($('textarea.tinymce').html(),'span.segment').last().attr('data-stime')
       // AudioPlayer.jPlayer("pause", $($('textarea.tinymce').html(),'span.segment').first().attr('data-stime'));
        // remove the class to let the user seek the time
       // AudioPlayer.removeClass('playerStoppedBefore')
    }
    // bind data to controls
    function BindData(response,prevOrNext) {

        if (response.ItemOrder == "last") {
            $('#MainContent_btnNext').attr('disabled', 'disabled');
        }

         $('#MainContent_ddlOtherTitles').val(0);
         $('#MainContent_ddlCommittee').val(0).hide();
        // update editor text
        if (response.Message == "success") {
            $(".btnAddProcuder").removeAttr('disabled', 'disabled');
            // update text controls value
            $("#MainContent_elm1").val(response.Item.Text);
            $("#MainContent_CurrentItemID").val(response.FragOrderInXml);
            $("#MainContent_txtComments").val(response.Item.CommentOnText);
            $("#MainContent_txtFooter").val(response.Item.PageFooter);
            $("#MainContent_txtSpeakerJob").html(response.AttendantJobTitle);
            $("#MainContent_txtSpeakerOtherJob").val(response.Item.CommentOnAttendant);
            $('#MainContent_imgSpeakerAvatar').attr("src",response.AttendantAvatar);
            // bind drop down lists
            var AgendaItem_SelectedID = $("#MainContent_ddlAgendaItems > option:selected").attr("value");
            var AgendaSubItem_SelectedID = $("#MainContent_ddlAgendaSubItems > option:selected").attr("value");
            var AgendaSubItem_html = $("#MainContent_ddlAgendaSubItems").html();
            var Speakers_SelectedID = $("#MainContent_ddlSpeakers").val();
            if(Speakers_SelectedID == 1.5)
            {
             //Add New Option
             $('#MainContent_ddlSpeakers').append($('<option>', {
                    value: response.SpeakerID,
                    text: $('.txtNewSpeaker').val()
                 })); 
            }
            if(prevOrNext == 1 && Speakers_SelectedID == 1.5)
            {
              //  prevSpeakerTitle = $('.txtNewSpeaker').val();
                 prevSpeakerIndex = response.Item.AttendantID;
                //        prevSpeakerTitle = SpeakerJob;
                //        prevSpeakerImgUrl = SpeakerImgUrl;
            }
            $('#MainContent_txtNewSpeaker').val('');
            $('#divNewSpeaker').hide();
            $('.agendaItemId').val(response.AgendaItemID);
            $('.attachId').val(response.AttachID);
            $('.voteId').val(response.VoteID);
            $('.agendaItemTxt').html(response.AgendaItemText);
            if (response.AgendaItemText == "غير معرف") {
                $('.divAgenda').hide();
            } else {
                $('.divAgenda').show();
            }
            if (response.AttachID == "0") {
                $('.divAttach').hide();
                $('.spanAttachTitle').html('');
            } else {
                $('.divAttach').show();
                $('.spanAttachTitle').html(response.AttachText);
            }
            if (response.VoteID == "0") {
                $('.divVote').hide();
                $('.spanVoteSubject').html('');
            } else {
                $('.divVote').show();
                $('.spanVoteSubject').html(response.VoteSubject);
            }
            //alert(AgendaSubItem_SelectedID);

            // set start and end time in hidden fields
            startTime.val(response.PargraphStartTime);
            endTime.val(response.PargraphEndTime);

            currentOrder.val(response.ItemFragOrder);
            // agenda items DDL
            $("#MainContent_ddlAgendaItems").html("");
            $("#MainContent_ddlAgendaItems").append($("<option selected='selected'></option>").val("0").html("-------- اختر البند --------"));
            $.each(response.AgendaItems, function() {

                $("#MainContent_ddlAgendaItems").append($("<option></option>").val(this['ID']).html(this['Text']).attr('IsGroupSubAgendaItems', this['IsGroupSubAgendaItems']));
            });
            //select option
            // $("#MainContent_ddlAgendaItems").val(

            if (response.Item.AgendaItemID != null && response.Item.AgendaItemID != 0) {
                $("#MainContent_ddlAgendaItems > option[value=" + response.Item.AgendaItemID + "]").attr('selected', 'selected');
            } else {
                $("#MainContent_ddlAgendaItems > option[value=" + AgendaItem_SelectedID + "]").attr('selected', 'selected');
            }
            // agenda sub items DDL
            $("#MainContent_ddlAgendaSubItems").html("");
            //$('#MainContent_ddlAgendaSubItems').removeAttr('disabled')
            if (response.Item.AgendaSubItemID != null && response.Item.AgendaSubItemID != 0) {
                $.each(response.AgendaSubItems, function() {
                    $("#MainContent_ddlAgendaSubItems").append($("<option></option>").val(this['ID']).html(this['Text']));
                });
                $("#MainContent_ddlAgendaSubItems > option[value=" + response.Item.AgendaSubItemID + "]").attr('selected', 'selected');
            } else {
                //25-03-2012 -- UN
                $("#MainContent_ddlAgendaSubItems").attr("disabled", "disabled");
                $("#MainContent_ddlAgendaSubItems").html(AgendaSubItem_html);
                $("#MainContent_ddlAgendaSubItems > option[value=" + AgendaSubItem_SelectedID + "]").attr('selected', 'selected');
            }
            // speaker DDL
            try{
            if (response.Item.AttendantID != null && response.Item.AttendantID != 0) {
                $("#MainContent_ddlSpeakers > option:selected").removeAttr("selected");
                $("#MainContent_ddlSpeakers > option[value=" + response.Item.AttendantID + "]").attr('selected', 'selected');
                $("#select2-MainContent_ddlSpeakers-container").html($('#MainContent_ddlSpeakers :selected').text());
            } else {
                $("#MainContent_ddlSpeakers > option[value=" + Speakers_SelectedID + "]").attr('selected', 'selected');
                $("#select2-MainContent_ddlSpeakers-container").html($('#MainContent_ddlSpeakers :selected').text());
            }
           }catch(err){
}
            	if($("#MainContent_ddlSpeakers > option:selected").text() == "غير محدد"){
                    $('#MainContent_ddlOtherTitles').val(0).attr('disabled', 'disabled');
                    $('#MainContent_ddlCommittee').val(0).hide().attr('disabled', 'disabled');
                    $('#MainContent_txtSpeakerOtherJob').val("").attr('disabled', 'disabled');
                    }

            // end binding DDL
            // to hide some controls base on current fragment order, i.e hide next when we are in the last fragment
            if (response.ItemOrder == "first") {
                $(".prev").attr("disabled", "disabled");
                allInputs.add(".next").removeAttr('disabled');
                $(".sameAsPrevSpeaker").attr("disabled", "disabled");
            } else if (response.ItemOrder == "last") {
                $(".sameAsPrevSpeaker,.prev,.finish").add(allInputs).removeAttr("disabled");
                $(".next").attr("disabled", "disabled");
            } else {
                $(".next,.prev").removeAttr("disabled");
                // $(".sameAsPrevSpeaker").removeAttr("disabled"); //kill same as
            }

            if (response.Ignored) {
                $(".chkIgnoredSegment").attr('checked', 'checked');
            } else {
                $('.chkIgnoredSegment').removeAttr('checked');
            }

            // alert('response.IsGroupSubAgendaItems ' + response.IsGroupSubAgendaItems);

            //usama march                
            if (response.IsGroupSubAgendaItems == true) {
                $('.chkGroupSubAgendaItems').attr('checked', 'checked');
                $("#MainContent_ddlAgendaSubItems").attr('disabled', 'disabled');

            } else if (response.IsGroupSubAgendaItems != null) {
                $('.chkGroupSubAgendaItems').removeAttr('checked');
                $("#MainContent_ddlAgendaSubItems").removeAttr('disabled');
            }
            //if not the same speaker
            if (!response.SameAsPrevSpeaker) //&& response.Item.AttendantID == null) {
            {
                allInputs.removeAttr('disabled');
                $('.sameAsPrevSpeaker').removeAttr('disabled').removeAttr('checked');
            } else { // 
                $('.sameAsPrevSpeaker').attr('checked', 'checked');
                allInputs.attr('disabled', 'disabled');
            }
            if (response.IsSessionPresident == "0") //&& response.Item.AttendantID == null) {
            {
                $('.isSessionPresident').removeAttr('checked');
            }
             else 
            {  
                $('.isSessionPresident').attr('checked', 'checked');
            }
            if (response.Item.AttendantID == 0) { //if data is from xml, so initialized the speaker
                $("#MainContent_ddlSpeakers").val(0).trigger("change");
                $("#select2-MainContent_ddlSpeakers-container").html($('#MainContent_ddlSpeakers :selected').text());
                allInputs.removeAttr('disabled');

                //usama march
                if ($(".chkGroupSubAgendaItems").is(':checked')) {
                    $("#MainContent_ddlAgendaSubItems").attr('disabled', 'disabled');
                }

                $('.sameAsPrevSpeaker').removeAttr('disabled');
                $('.sameAsPrevSpeaker').removeAttr('checked');
                $('.isSessionPresident').removeAttr('checked');
                $('.chkIgnoredSegment').removeAttr('checked');
            }

            if ($("#MainContent_chkGroupSubAgendaItems").is(':checked'))
                $("#MainContent_ddlAgendaSubItems").attr('disabled', 'disabled');
        } else {
            //alert("عفواً . غير مسموح لك بالتعديل في هذه الصفحة");

            $(".prev,.next").removeAttr("disabled");
        }
    }
    // save and exit button onclick
    $("#btnSaveAndExit").click(function() {
        if ($("#editSessionFileForm").valid()) {
            var mode = "1";
            var sessionContentItem;
            if ($(".hdPageMode").val().length == 0) {
                mode = "1";
            } else {
                mode = $(".hdPageMode").val();
                sessionContentItem = $(".hdSessionContentItemID").val();
            }
            var sessionID = $(".sessionID").val();
            $("#btnSaveAndExit").attr("disabled", "disabled");
            //  var AgendaItemID = $("#MainContent_ddlAgendaItems > option:selected").length > 0 ? $("#MainContent_ddlAgendaItems > option:selected").attr("value") : "";
            //  var AgendaSubItemID = $("#MainContent_ddlAgendaSubItems > option:selected").length > 0 ? $("#MainContent_ddlAgendaSubItems > option:selected").attr("value") : "";
            var AgendaItemID = $('.agendaItemId').val();
            var AttachID = $('.attachId').val();
            var VoteID = $('.voteId').val();
            var SpeakerID = $("#MainContent_ddlSpeakers > option:selected").val();
            SpeakerID = SpeakerID == 1.5 ? -1 : SpeakerID;
            var SpeakerName = $("#MainContent_txtNewSpeaker").val();
            var SameAsPrevSpeaker = $(".sameAsPrevSpeaker").is(':checked');
            var IsSessionPresident = $(".isSessionPresident").is(':checked') ? "1" : "0";
            var IsGroupSubAgendaItems = $(".chkGroupSubAgendaItems").is(':checked');
            var Ignored = $(".chkIgnoredSegment").is(':checked');
            var SpeakerJob = $("#MainContent_txtSpeakerOtherJob").val();
            var Text = encodeURI($("#MainContent_elm1").attr("value"));
            var Comments = $("#MainContent_txtComments").val();
            var Footer = $("#MainContent_txtFooter").val();

            if (SameAsPrevSpeaker == false && prevAgendaItemIndex == AgendaItemID &&
                prevSpeakerIndex == SpeakerID) {
                if (confirm('لقد اخترت نفس بيانات المتحدث السابق، هل تريد دمج هذا النص مع سابقه ؟')) {

                    $(".sameAsPrevSpeaker").attr('checked', 'checked');
                    $("#MainContent_ddlAgendaItems,#MainContent_ddlAgendaSubItems,#MainContent_ddlSpeakers,#MainContent_txtSpeakerJob,#specialBranch").attr('disabled', 'disabled');
                    SameAsPrevSpeaker = true;
                } else {
                    $("#MainContent_ddlSpeakers").val(0).trigger("change");
                    $("#select2-MainContent_ddlSpeakers-container").html($('#MainContent_ddlSpeakers :selected').text());
                    ed.setProgressState(0);
                    return;
                }
            }

            if (AgendaItemID != 0) {
                jQuery.ajax({
                    cache: false,
                    type: 'post',
                    url: 'EditSessionHandler.ashx',
                    data: {
                        funcname: 'SaveAndExit',
                        AgendaItemID: AgendaItemID,
                        AttachID: AttachID,
                        VoteID: VoteID,
                        SpeakerID: SpeakerID,
                        SpeakerName: SpeakerName,
                        SameAsPrevSpeaker: SameAsPrevSpeaker,
                        IsSessionPresident: IsSessionPresident,
                        IsGroupSubAgendaItems: IsGroupSubAgendaItems,
                        Ignored: Ignored,
                        SpeakerJob: SpeakerJob,
                        Text: Text,
                        Comments: Comments,
                        Footer: Footer,
                        editmode: mode,
                        scid: sessionContentItem

                    },
                    dataType: 'json',
                    success: function(response) {
                        if (response.Message == "success") {
                            $("btnSaveAndExit").removeAttr("disabled");
                            if (mode == "2")
                                window.location = "ReviewNotes.aspx?sid=" + sessionID;
                            else
                            if (mode == "3")
                                window.location = "Review.aspx?sid=" + sessionID;
                            else
                                window.location = "default.aspx";
                        } else {
                            alert("لقد حدث خطأ");

                            allInputs.removeAttr('disabled');
                        }
                    },
                    error: function() {
                        alert("لقد حدث خطأ");

                        allInputs.removeAttr('disabled');
                    }
                });
            }
        }
    });

    // save and exit button onclick
    $("#btnSaveOnly").click(function() {
       // if ($("#editSessionFileForm").valid()) {
            var mode = "1";
            var sessionContentItem;
            if ($(".hdPageMode").val().length == 0) {
                mode = "1";
            } else {
                mode = $(".hdPageMode").val();
                sessionContentItem = $(".hdSessionContentItemID").val();
            }
            var sessionID = $(".sessionID").val();
            $("#btnSaveOnly").attr("disabled", "disabled");
            //  var AgendaItemID = $("#MainContent_ddlAgendaItems > option:selected").length > 0 ? $("#MainContent_ddlAgendaItems > option:selected").attr("value") : "";
            //  var AgendaSubItemID = $("#MainContent_ddlAgendaSubItems > option:selected").length > 0 ? $("#MainContent_ddlAgendaSubItems > option:selected").attr("value") : "";
            var AgendaItemID = $('.agendaItemId').val();
            var AttachID = $('.attachId').val();
            var VoteID = $('.voteId').val();
   
            var SpeakerID = $("#MainContent_ddlSpeakers").val();
            SpeakerID = SpeakerID == 0 ?  $("#MainContent_ddlSpeakers option:contains(" + "غير محدد" + ")").attr('selected', 'selected').val() : SpeakerID;
            SpeakerID = SpeakerID == 1.5 ? -1 : SpeakerID;
           // $("#MainContent_ddlSpeakers").val(SpeakerID);
            //$("#select2-MainContent_ddlSpeakers-container").html($('#MainContent_ddlSpeakers :selected').text());

            var SpeakerName = $("#MainContent_txtNewSpeaker").val();
            var SameAsPrevSpeaker = $(".sameAsPrevSpeaker").is(':checked');
            var IsSessionPresident = $(".isSessionPresident").is(':checked') ? "1" : "0";
            var IsGroupSubAgendaItems = $(".chkGroupSubAgendaItems").is(':checked');
            var Ignored = $(".chkIgnoredSegment").is(':checked');
            var SpeakerJob = $("#MainContent_txtSpeakerOtherJob").val();
            var Text = encodeURI($("#MainContent_elm1").attr("value"));
            var Comments = $("#MainContent_txtComments").val();
            var Footer = $("#MainContent_txtFooter").val();

            //$("#MainContent_ddlSpeakers option:contains(" + "أخرى" + ")").val() != SpeakerID &&
            if (SameAsPrevSpeaker == false && prevAgendaItemIndex == AgendaItemID && 
                prevSpeakerIndex == SpeakerID) {
                if (confirm('لقد اخترت نفس بيانات المتحدث السابق، هل تريد دمج هذا النص مع سابقه ؟')) {

                    $(".sameAsPrevSpeaker").attr('checked', 'checked');
                    $("#MainContent_ddlAgendaItems,#MainContent_ddlAgendaSubItems,#MainContent_ddlSpeakers,#MainContent_txtSpeakerJob,#specialBranch").attr('disabled', 'disabled');
                    SameAsPrevSpeaker = true;
                } else {
                    $("#MainContent_ddlSpeakers").val(0).trigger("change");
                    $("#select2-MainContent_ddlSpeakers-container").html($('#MainContent_ddlSpeakers :selected').text());
                    ed.setProgressState(0);
                    return;
                }
            }

            if (AgendaItemID != 0) {
                jQuery.ajax({
                    cache: false,
                    type: 'post',
                    url: 'EditSessionHandler.ashx',
                    data: {
                        funcname: 'SaveOnly',
                        AgendaItemID: AgendaItemID,
                        AttachID: AttachID,
                        VoteID: VoteID,
                        SpeakerID: SpeakerID,
                        SpeakerName: SpeakerName,
                        SameAsPrevSpeaker: SameAsPrevSpeaker,
                        IsSessionPresident: IsSessionPresident,
                        IsGroupSubAgendaItems: IsGroupSubAgendaItems,
                        Ignored: Ignored,
                        SpeakerJob: SpeakerJob,
                        Text: Text,
                        Comments: Comments,
                        Footer: Footer,
                        editmode: mode,
                        scid: sessionContentItem
                    },
                    dataType: 'json',
                    success: function(response) {
                        if (response.Message == "success") {
                            $("#btnSaveOnly").removeAttr("disabled");
                            var Speakers_SelectedID = $("#MainContent_ddlSpeakers").val();
                            //alert(Speakers_SelectedID);
                            if(Speakers_SelectedID == 1.5)
                            {
                             //Add New Option
                             $('#MainContent_ddlSpeakers').append($('<option>', {
                                    value: response.SpeakerID,
                                    text: $('.txtNewSpeaker').val()
                                 })); 
                            }
                            $('#MainContent_txtNewSpeaker').val('');
                            $('#divNewSpeaker').hide();
 
                          try{
                                    if (response.Item.AttendantID != null && response.Item.AttendantID != 0) {
                                        $("#MainContent_ddlSpeakers > option:selected").removeAttr("selected");
                                        $("#MainContent_ddlSpeakers > option[value=" + response.Item.AttendantID + "]").attr('selected', 'selected');
                                        $("#select2-MainContent_ddlSpeakers-container").html($('#MainContent_ddlSpeakers :selected').text());
                                    } else {
                                        $("#MainContent_ddlSpeakers > option[value=" + Speakers_SelectedID + "]").attr('selected', 'selected');
                                        $("#select2-MainContent_ddlSpeakers-container").html($('#MainContent_ddlSpeakers :selected').text());
                                    }
                                   }catch(err){
                        }
            	                        if($("#MainContent_ddlSpeakers > option:selected").text() == "غير محدد"){
                                            $('#MainContent_ddlOtherTitles').val(0).attr('disabled', 'disabled');
                                            $('#MainContent_ddlCommittee').val(0).hide().attr('disabled', 'disabled');
                                            $('#MainContent_txtSpeakerOtherJob').val("").attr('disabled', 'disabled');
                                            }
					
					


                            alert("تم الحفظ بنجاح");
                        }else {
                            alert("لقد حدث خطأ");
                            allInputs.removeAttr('disabled');
                        }
                    },
                    error: function() {
                        alert("لقد حدث خطأ");
                        allInputs.removeAttr('disabled');
                    }
                });
            }
        //}
    });

    // finish: save and exit button onclick
    $(".finish").click(function() {
        if ($("#editSessionFileForm").valid()) {
            $(".finish").attr("disabled", "disabled");
            // var AgendaItemID = $("#MainContent_ddlAgendaItems > option:selected").length > 0 ? $("#MainContent_ddlAgendaItems > option:selected").attr("value") : "";
            // var AgendaSubItemID = $("#MainContent_ddlAgendaSubItems > option:selected").length > 0 ? $("#MainContent_ddlAgendaSubItems > option:selected").attr("value") : "";
            var AgendaItemID = $('.agendaItemId').val();
            var AttachID = $('.attachId').val();
            var VoteID = $('.voteId').val();
            var SpeakerID = $("#MainContent_ddlSpeakers > option:selected").val();
            SpeakerID = SpeakerID == 1.5 ? -1 : SpeakerID;
            var SpeakerName = $("#MainContent_txtNewSpeaker").val();
            var SameAsPrevSpeaker = $(".sameAsPrevSpeaker").is(':checked');
            var IsSessionPresident = $(".isSessionPresident").is(':checked') ? "1" : "0";
            var IsGroupSubAgendaItems = $(".chkGroupSubAgendaItems").is(':checked');
            var Ignored = $(".chkIgnoredSegment").is(':checked');
            var SpeakerJob = $("#MainContent_txtSpeakerOtherJob").val();
            var Text = encodeURI($("#MainContent_elm1").attr("value"));
            var Comments = $("#MainContent_txtComments").val();
            var Footer = $("#MainContent_txtFooter").val();
            var sessionID = $(".sessionID").val();

            if (SameAsPrevSpeaker == false && prevAgendaItemIndex == AgendaItemID &&
                prevSpeakerIndex == SpeakerID) {
                if (confirm('لقد اخترت نفس بيانات المتحدث السابق، هل تريد دمج هذا النص مع سابقه ؟')) {

                    $(".sameAsPrevSpeaker").attr('checked', 'checked');
                    $("#MainContent_ddlAgendaItems,#MainContent_ddlAgendaSubItems,#MainContent_ddlSpeakers,#MainContent_txtSpeakerJob,#specialBranch").attr('disabled', 'disabled');
                    SameAsPrevSpeaker = true;
                } else {
                    $("#MainContent_ddlSpeakers").val(0).trigger("change");
                    $("#select2-MainContent_ddlSpeakers-container").html($('#MainContent_ddlSpeakers :selected').text());
                    ed.setProgressState(0);
                    return;
                }
            }

            if (AgendaItemID != 0) {
                jQuery.ajax({
                    cache: false,
                    type: 'post',
                    url: 'EditSessionHandler.ashx',
                    data: {
                        funcname: 'UpdateSessionFileStatusCompleted',
                        AgendaItemID: AgendaItemID,
                        AttachID: AttachID,
                        VoteID: VoteID,
                        SpeakerID: SpeakerID,
                        SpeakerName: SpeakerName,
                        SameAsPrevSpeaker: SameAsPrevSpeaker,
                        IsSessionPresident:IsSessionPresident,
                        IsGroupSubAgendaItems: IsGroupSubAgendaItems,
                        Ignored: Ignored,
                        SpeakerJob: SpeakerJob,
                        Text: Text,
                        Comments: Comments,
                        Footer: Footer,
                        sid: sessionID
                    },
                    dataType: 'json',
                    success: function(response) {
                        if (response.Message == "success") {
                            window.location = "default.aspx";
                        } else {
                            alert("لقد حدث خطأ");

                            allInputs.removeAttr('disabled');
                        }
                    },
                    error: function() {
                        alert("لقد حدث خطأ");

                        allInputs.removeAttr('disabled');
                    }
                });
            }
        }
    });

    // for the small window popup
    $('#specialBranch').click(function() {
            if ($(this).is(':checked')) {
                $('#smallwindow').show()
                $('select#MainContent_ddlAgendaSubItems').attr('disabled', 'disabled')
            } else {
                $('#smallwindow').hide()
                $('select#MainContent_ddlAgendaSubItems').removeAttr('disabled')
            }
        })
        // 
    $('#btnAddCustomAgendaItem').click(function() {
        if ($("#txtAgendaItem").valid()) {
            var itemText = $('#txtAgendaItem').val();
            var parentAgendaItemID = $("#MainContent_ddlAgendaItems").val();

            var dropdown = $("#MainContent_ddlAgendaSubItems");
            var isDuplicate = false;
            $("#MainContent_ddlAgendaSubItems > option").each(function() {
                if (jQuery.trim(this.text) == jQuery.trim(itemText)) {
                    isDuplicate = true;
                    alert("هذا البند الفرعي موجود .. لا يمكنك إضافة بندين بنفس الإسم");

                    return false;
                }
            });

            if (isDuplicate == true)
                return;
            else {
                jQuery.ajax({
                    cache: false,
                    type: 'post',
                    url: 'EditSessionHandler.ashx',
                    data: {
                        funcname: 'AddAgendaItem',
                        agendaitemtext: itemText,
                        sid: sessionID
                    },
                    dataType: 'json',
                    success: function(item_id) {
                        if (item_id != 0) {

                            $("#MainContent_ddlAgendaSubItems").removeAttr('disabled');
                            $('#smallwindow').hide();
                            $("#MainContent_ddlAgendaSubItems > option:selected").removeAttr('selected')
                            $("#MainContent_ddlAgendaSubItems").append($("<option selected='selected'></option>").val(item_id).html(itemText));
                            //$('select#MainContent_ddlAgendaSubItems').html("").attr('disabled', 'disabled');
                        } else {
                            alert("عفواً ... هذا البند تم تسجيله من قبل ")

                        }
                    },
                    error: function() {

                    }
                });
            }
        }
    });
    // add new job & edit button
    $('#addnewjobbutton').click(function (e) {
        if ($("#editSessionFile").valid()) {
            $('#newjobtitle').attr('class', 'done')
            // insert text
            var value = $('input[name=addnewjobtext]').val();
            $('#newjobtitle .donemode strong').html(value)
            // send the value
        }
        e.preventDefault()
    })
    $('#editnewjobbutton').click(function(e) {
            $('#newjobtitle').attr('class', 'edit')
            e.preventDefault()
        })
        // tinymce
    $('textarea.tinymce').tinymce({
        custom_undo_redo: true,
        // Location of TinyMCE script
        script_url: 'scripts/tiny_mce/tiny_mce.js',
        // General options
        theme: "advanced",
        plugins: "pagebreak,directionality,noneditable",
        language: "ar",
        // direction
        directionality: "rtl",
        // clean up
        cleanup: true,
        cleanup_on_startup: true,
        width: '100%',
        height: 400,
        theme_advanced_source_editor_wrap: true,
        // Theme options
        theme_advanced_buttons1: "bold,italic,|,justifycenter,justifyright,|,undo,redo",
        theme_advanced_buttons2: "",
        theme_advanced_buttons3: "",
        theme_advanced_buttons4: "",
        theme_advanced_path: false,
        theme_advanced_toolbar_location: "top",
        theme_advanced_toolbar_align: "right",
        theme_advanced_resizing: false,
        // Example content CSS (should be your site CSS)
        content_css: "styles/tinymce_content.css",
        // invalid elements
        invalid_elements: "applet,body,button,caption,fieldset ,font,form,frame,frameset,head,,html,iframe,img,input,link,meta,object,option,param,script,select,style,table,tbody,tr,td,th,tbody,textarea,xmp",
        // valid elements
        valid_elements: "@[class],span[*],p[*],strong,em,blockquote,br,i[!id]",
        force_br_newlines: true,
        force_p_newlines: false,
        forced_root_block: false,
        setup: function(ed) {
            // function to make the span editable
            function editableSpan(ed, e, higlightonly) {
                if (e) {
                    // remove all classes from the editor
                    $('span.editable', ed.contentDocument).removeClass('editable');
                    // add class editable
                    if (e.nodeName == 'SPAN') {
                        // add class editable
                        $(e).addClass('editable');
                        // check the flag
                        if(!higlightonly){
                            // time from the span
                            var time = Math.floor($(e).attr('data-stime'))
                            // seek
                            $("#jquery_jplayer_1").jPlayer("pause", time);
                        }
                    }
                }
            }
            // click on text tinyMCE editor
            ed.onMouseUp.add(function(ed, e) {
                editableSpan(ed, e.target)
            });
            // click on text tinyMCE editor
            ed.onKeyUp.add(function(ed, e) {
                editableSpan(ed, ed.selection.getStart(),true)
            });
            // on keys
            editorEvents(ed);
            // oninit
            ed.onInit.add(function (ed) {
                var AudioPlayer = $("#jquery_jplayer_1");
                // all span segments
                var all_spans_segments = $('span.segment', ed.contentDocument);
                // hover effect
                all_spans_segments.live("mouseover mouseout", function (event) {
                    if (event.type == "mouseover") {
                        // remove all classes
                        $(this).toggleClass('hover');
                    } else {
                        // remove hover class
                        $(this).removeClass('hover');
                    }
                });
                // jplayer
                var playertime;
                /*AudioPlayer.bind($.jPlayer.event.seeking, function(event) {
                    // Add a listener to report the time play began
                    console.log('seeked')
                });*/
                AudioPlayer.jPlayer({
                    swfPath: "/scripts/jPlayer/",
                    wmode: "window",
                    solution: 'html, flash',
                    supplied: "mp3",
                    preload: 'metadata',
                    volume: 1,
                    cssSelectorAncestor: '#jp_container_1',
                    errorAlerts: false,
                    warningAlerts: false,
                    ready: function () {
                        // get start and end time in hidden fields
                        var firstTime = Math.floor($('span.segment:first', ed.contentDocument).attr('data-stime'));
                        // play the jplayer
                        $(this).jPlayer("setMedia", {
                            mp3: $(".MP3FilePath").val() // mp3 file path
                        }).jPlayer("play", firstTime);
                        // next x seconds button
                        $('.jp-audio .next-jp-xseconds').click(function (e) {
                            var lastTime = Math.floor($('span.segment:last', ed.contentDocument).attr('data-stime'));
                            if(!((playertime+5) >= lastTime)){
                                AudioPlayer.jPlayer("play", playertime + 5);
                            }
                        })
                        // prev x seconds button
                        $('.jp-audio .prev-jp-xseconds').click(function (e) {
                            if(!((playertime-5) <= firstTime)){
                                AudioPlayer.jPlayer("play", playertime - 5);
                            }
                        })
                    },
                    timeupdate: function (event) {
                        if (!$(this).data("jPlayer").status.paused) {
                            // all span segments
                            var all_spans_segments = $('span.segment', ed.contentDocument);
                            //firstTime = Math.floor(startTime.val())
                            var firstTime = Math.floor($('span.segment:first', ed.contentDocument).attr('data-stime'));
                            var lastTime = Math.floor($('span.segment:last', ed.contentDocument).attr('data-stime'));
                            // remove all classes
                            all_spans_segments.removeClass('highlight editable');
                            // highlight the word by time
                            playertime = event.jPlayer.status.currentTime;
                            if (Math.round(playertime) > lastTime) {
                                AudioPlayer.jPlayer('pause', firstTime);
                            } else if (Math.floor(playertime) < firstTime) {
                                $(this).jPlayer('play',Math.round(startTime.val()));
                            } else {
                                //
                                var playerfixedTime = playertime.toFixed(2);
                                var playerfixedTimeString = playerfixedTime.toString();
                                var playerfixedTimeToArray = playerfixedTimeString.split('.');
                                // highlight the span
                                var highlight = all_spans_segments.filter('span.segment[data-stime^=' + playerfixedTimeToArray[0] + '\\.]');
                                if (highlight.length > 1) {
                                    highlight = highlight.filter(function () {
                                        // get the nearest span
                                        var spanTime = $(this).attr('data-stime')
                                        var spanTimeToArray = spanTime.split('.');
                                        var spanfragment = spanTimeToArray[1];
                                        var playerfragment = playerfixedTimeToArray[1];
                                        if (playerfragment >= spanfragment) {
                                            return $(this);
                                        }
                                    }).filter(':last')
                                }
                                // highlight
                                highlight.addClass('highlight')
                            }
                            if ($.browser.msie && $.browser.version == '9.0') {
                                if (Math.round(playertime) > lastTime || Math.floor(playertime) < firstTime) {
                                    AudioPlayer.jPlayer('stop')
                                }
                            }
                        }
                    }
                });
                // jplayer shorcuts
                $(document).add(ed.dom.doc.body).bind('keydown', function (e) {
                    var k = e.keyCode;
                    if ($(e.target).find(':input,select').length) { // not input
                        if (k == 88 || k == 67 || k == 86 || k == 66) {
                            e.preventDefault();
                            return;
                        }
                    }
                    if (k == 116) {
                        window.location.href = window.location.href;
                    }
                }).bind('keydown', 'alt+t', function() {
                    // add agenda item
                    $(".addingNewAgendaItem").trigger('click')
                }).bind('keydown', 'alt+v', function() {
                    // add procedure
                    $(".btnAddProcuder").trigger('click')
                }).bind('keydown', 'alt+l', function() {
                    // add attach
                    $(".btnAssignAttachToContentItem").trigger('click')
                }).bind('keydown', 'alt+w', function() {
                    // add vote
                    $(".btnAddNewVote").trigger('click')
                }).bind('keydown', 'alt+s', function() {
                    // previous page
                    $(".btn.prev").trigger('click')
                }).bind('keydown', "alt+r", function() {
                    // previous page
                    $(".btn.split").trigger('click')
                }).bind('keydown', "alt+p", function() {
                    // previous page
                    $(".btn.btnSaveAndExit").trigger('click')
                }).bind('keydown', 'alt+k', function() {
                    // previous page
                    $(".btn.finish").trigger('click')
                }).bind('keydown', 'alt+a', function() {
                    // play & pause player
                    if (AudioPlayer.data("jPlayer").status.paused) {
                        AudioPlayer.jPlayer("play");
                    } else {
                        AudioPlayer.jPlayer("pause");
                    }
                }).bind('keydown', 'alt+q', function() {
                    // stop player
                    AudioPlayer.jPlayer("stop");
                }).bind('keydown', 'alt+j', function() {
                    // next page
                    $(".btn.next").trigger('click')
                }).bind('keydown', 'alt+5', function() {
                    // next x seconds
                    $('.jp-audio .next-jp-xseconds').trigger('click')
                }).bind('keydown', 'alt+4', function() {
                    // prev x seconds
                    $('.jp-audio .prev-jp-xseconds').trigger('click')
                })
            });
        }
    });

    // tinymce for the popup window
    var defaultOptions = {
        custom_undo_redo: true,
        // Location of TinyMCE script
        script_url: 'scripts/tiny_mce/tiny_mce.js',
        // General options
        theme: "advanced",
        plugins: "pagebreak,directionality,noneditable",
        language: "ar",
        // direction
        directionality: "rtl",
        // clean up
        cleanup: true,
        cleanup_on_startup: true,
        width: '100%',
        height: 400,
        theme_advanced_source_editor_wrap: true,
        // Theme options
        theme_advanced_buttons1: "bold,italic,|,justifycenter,justifyright,|,undo,redo",
        theme_advanced_buttons2: "",
        theme_advanced_buttons3: "",
        theme_advanced_buttons4: "",
        theme_advanced_path: false,
        theme_advanced_toolbar_location: "top",
        theme_advanced_toolbar_align: "right",
        theme_advanced_resizing: false,
        // Example content CSS (should be your site CSS)
        content_css: "styles/tinymce_content.css",
        // invalid elements
        invalid_elements: "applet,body,button,caption,fieldset ,font,form,frame,frameset,head,,html,iframe,img,input,link,meta,object,option,param,script,select,style,table,tbody,tr,td,th,tbody,textarea,xmp",
        // valid elements
        valid_elements: "@[class],span[*],p[*],strong,em,blockquote,br,i[!id]",
        force_br_newlines: true,
        force_p_newlines: false,
        forced_root_block: false,
        setup : function(ed) {
            // on keypress
             editorEvents(ed);
        }
    };

    // get where the cursor position
    function getCursorPosition(ed,callBack){
        // save the caret position
        var bookmark = ed.selection.getBookmark();
        // get the mark
        var $mark = $(ed.getBody()).find('#'+bookmark.id+'_start');
        // get the tags
        var previousSibling = $mark[0].previousSibling;
        var nextSibling = $mark[0].nextSibling;
        // get the accurate tags
        if(!(previousSibling) || (previousSibling && previousSibling.length == 0)){
            previousSibling = ($mark.parent().length) ? $mark.parent()[0].previousSibling : false;
        }
        // get the accurate tags
        if(!(nextSibling) || (nextSibling && nextSibling.length == 0)){
            nextSibling = ($mark.parent().length) ? $mark.parent()[0].nextSibling : false;
        }
        // collect the mark
        var objects = {
            $mark:$mark,
            $parent:$mark.parent(),
            nextSibling:nextSibling,
            previousSibling:previousSibling
        };
        // check callback
        if(callBack){
            var callBackData = callBack(objects);
            // move to the caret position
            ed.selection.moveToBookmark(bookmark); 
            // return
            return callBackData;
        }
        // move to the caret position
        ed.selection.moveToBookmark(bookmark); 
        // return
        return objects;
    }

    // function for on key press
    function editorEvents(ed){
        // on keydown
        ed.onKeyDown.add(function (ed, e) {
            // to disable the merge of p tag
            var dom = ed.dom;
            var currentNode = ed.selection.getNode();
            var backSpaceKey = (e.keyCode == 8);
            var deleteKey = (e.keyCode == 46);
            // backspace
            if (backSpaceKey || deleteKey) {
                // get where the cursor position
                if(getCursorPosition(ed,function(OB){
                    if(backSpaceKey){
                        if(
                            (OB.previousSibling && OB.previousSibling.nodeName == 'P') ||
                            (OB.$parent && OB.$parent[0].nodeName == 'P' && OB.previousSibling && OB.previousSibling.nodeName == 'SPAN')
                        ){
                            if(OB.$parent.text().trim() == ""){
                                return false;
                            }else{
                                return true;
                            }
                        }
                    }else if(
                        (OB.nextSibling && OB.nextSibling.nodeName == 'P') ||
                        (OB.$parent && OB.$parent[0].nodeName == 'P' && OB.nextSibling && OB.nextSibling.nodeName == 'SPAN') ||
                        (OB.nextSibling && OB.$parent.text() == '')
                    ){
                        if(OB.$parent.text().trim() == ""){
                                return false;
                            }else{
                                return true;
                            }
                    }
                })){
                    e.preventDefault();
                }
            }
        });
        // check if the user writes on no where
        ed.onKeyPress.add(function (ed, e) {
            var dom = ed.dom;
            var currentNode = ed.selection.getNode();
            if (currentNode.nodeName == 'BODY' && e.charCode != 13) {
                // select the nearest tag
                var nextElement = ed.selection.getRng().startContainer.nextSibling;
                if (nextElement) {
                    var mark = $('<i>.</i>');
                    $(nextElement).prepend(mark);
                    ed.selection.select(mark[0]);
                    ed.execCommand('mceCleanup');
                }
            }
        });
        // click on text tinyMCE editor
        ed.onKeyUp.add(function(ed, e) {
            // check if the backspace
            if(e.keyCode == 8 || e.keyCode == 46){
                var selectedTag = ed.selection.getEnd();
                if(selectedTag.nodeName == 'SPAN' && selectedTag.nextSibling && selectedTag.nextSibling.nodeName == 'SPAN'){
                    // VARS
                    var $selectedTag = $(selectedTag);
                    var nextSibling = selectedTag.nextSibling;
                    var $nextSibling = $(nextSibling);
                    // add teh text to the selected tag
                    $selectedTag.append($nextSibling.html());
                    // remove the old on
                    $nextSibling.remove();
                    // clean up
                    ed.execCommand('mceCleanup');
                }
            }
        });
    }
    //
    $('#MainContent_Textarea1, #MainContent_Textarea2').tinymce(defaultOptions);
    // change the default options
    var newOptions = $.extend({},defaultOptions);
    newOptions.height = 200;
    $('#MainContent_Textarea3').tinymce(newOptions);

    // ajax load the dropdown list
    jQuery.ajax({
        cache: false,
        type: 'get',
        url: 'ProcedureHandler.ashx',
        data: {
            funcname: 'GetProcedureTypes'
        },
        dataType: 'json',
        success: function(response) {
            if (response != '') {
                // vars
                var MainContent_DropDownList1 = $('#MainContent_DropDownList1');
                var listData = $('#listData');
                // loop to create the options
                for (var i = 0; i < response.length; i++) {
                    var option = response[i];
                    // create the option in the dropdown list
                    MainContent_DropDownList1.append($('<option></option>').attr('value', option.ID).text(option.ProcedureType));
                }
                // first list
                MainContent_DropDownList1.change(function() {
                    if (MainContent_DropDownList1.val() != 0) {
                        // reset
                        listData.html('');
                        // vars
                        var selectOptionIndex = $('option:selected', MainContent_DropDownList1).index() - 1;
                        var newDropDownListValues = response[selectOptionIndex];
                        var newDropDownListValuesLength = newDropDownListValues.SessionProcedureObj.length;
                        // loop to create the options
                        for (var i = 0; i < newDropDownListValuesLength; i++) {
                            var option = newDropDownListValues.SessionProcedureObj[i];
                            // create the option in the dropdown list
                            listData.append($('<li/>').data('value', option.ID).text(option.ProcedureTitle));
                        }
                    }else{
                        // reset
                        listData.html('');
                    }
                });
                // second list
                $(listData).delegate('li','click',function(){
                    // vars
                    var $this = $(this);
                    var addingParText = $this.text();
                    var clone = $('<p/>').append(addingParText).attr('procedure-id', $this.data('value'));
                    var ed = $('#MainContent_Textarea2').tinymce();
                    var tintMceActive = ed.selection;
                    var nodeName = tintMceActive.getNode().nodeName;
                    clone = clone.wrapAll('<div>');
                    var cloneHTML = clone.parent().html();

                    if (((nodeName == 'SPAN' || nodeName == 'P')) && (tintMceActive.getRng().startOffset != $(tintMceActive.getNode()).text().length)) {
                        $(tintMceActive.getNode()).before(cloneHTML);
                    } else if (nodeName == 'SPAN' || nodeName == 'P') {
                        $(tintMceActive.getNode()).after(cloneHTML);
                    } else {
                        ed.execCommand('mceInsertContent', false, cloneHTML);
                    }

                    // add to the undo manager
                    ed.undoManager.add();
                    // clean up
                    ed.execCommand('mceCleanup');
                });
            }
        },
        error: function () {

        }
    });
    // add procuder button
    $(".btnAddProcuder").click(function(e) {
        // get the editors
        var ed1 = $('#MainContent_elm1').tinymce();
        var ed2 = $('#MainContent_Textarea2').tinymce();
        // clear the html
        var htmlContent = ed1.getContent();
        var clone = $('<div>').append(htmlContent)
        clone.find('span').removeClass('highlight editable hover');
        ed2.setContent(clone.html());
        // clear the undo manager
        ed2.undoManager.clear();
        // show the popup
        $(".popupoverlay").show();
        $(".reviewpopup_cont2").show();
        e.preventDefault();
    });
    // add procuder yes button
    $(".approve2").click(function(e) {
        // bind the new value
        $('#MainContent_elm1').val($("textarea.splittinymce", '.reviewpopup_cont2').val());
         // add to the undo manager
        $('#MainContent_elm1').tinymce().undoManager.add();
        // close the popup
        $(".popupoverlay").hide();
        $(".reviewpopup_cont2").hide();
        e.preventDefault();
    });

    // add Attach button
    $(".btnAssignAttachToContentItem").click(function(e) {
        var checkedRadio = $(".rdlattachments input:radio");
        var attachId = $(".attachId").val();
        if (attachId) {
            checkedRadio.filter('[value="' + attachId + '"]').prop('checked', true);
        }

        $(".popupoverlay").show();
        $(".reviewpopup_cont4").show();
        $(".rdlattachments").attr("checked", "");
        e.preventDefault();
    });

    $(".btnAddAttach", '.reviewpopup_cont4').click(function(e) {
        var checkedRadio = $(".rdlattachments input:radio:checked");
        if (checkedRadio.length > 0) {
            $(".attachId").val(checkedRadio.val());
            $('.divAttach').show();
            $('.spanAttachTitle').html(checkedRadio.next().text());
        }
        // close the popup
        $(".popupoverlay").hide();
        $(".reviewpopup_cont4").hide();
        e.preventDefault();
    });

    $(".removeAttach").click(function(e) {
       $(".attachId").val('0');
       $('.divAttach').hide();
       $('.spanAttachTitle').html('');
       e.preventDefault();
    });

    function loadSessionVotes() {
        var voteId = $(".voteId").val();
        $('.rdlvotes').empty();
        //Load Available Votes
        jQuery.ajax({
            cache: false,
            type: 'post',
            url: 'VotingHandler.ashx',
            data: {
                funcname: 'GetSessionVotes',
                epsid: $(".eparId").val()
            },
            dataType: 'json',
            success: function(response) {
                var radio;
                var label;
                var div;
                for (i = 0; i < response.length; i++) {
                    radio = $('<input>').attr({
                        type: 'radio',
                        name: 'colorinput',
                        value: response[i].ID,
                        id: 'test' + response[i].ID
                    });
                    if (response[i].ID.toString() == voteId.toString()) {
                        radio.attr("checked", "checked");
                    }
                    div = $('<div class="rd">');
                    div.append(radio);
                    div.append('<label>' + response[i].NonSecretVoteSubject + '</label>');
                    $('.rdlvotes').append(div);
                }
                /* var checkedRadio = $(".rdlvotes input:radio");
               
                 if (voteId) {
                     checkedRadio.filter('[value="' + voteId + '"]').prop('checked', true);
                 }*/
            }
        });
    }
    // add Attach button
    $(".btnAddNewVote").click(function(e) {
        loadSessionVotes();
        $(".popupoverlay").show();
        $(".reviewpopup_cont5").show();
        e.preventDefault();
    });

    $(".btnAddVote", '.reviewpopup_cont5').click(function(e) {
        var checkedRadio = $(".rdlvotes input:radio:checked");
        if (checkedRadio.length > 0) {
            $(".voteId").val(checkedRadio.val());
            $('.spanVoteSubject').html(checkedRadio.next().text());
            $('.divVote').show();
        }
        // close the popup
        $(".popupoverlay").hide();
        $(".reviewpopup_cont5").hide();
        e.preventDefault();
    });

     $(".removeVote").click(function(e) {
        $(".voteId").val('0');
        $('.spanVoteSubject').html('');
        $('.divVote').hide();
        e.preventDefault();
    });

    // add new agenda button
    $(".addingNewAgendaItem").click(function(e) {
        // show the popup
        $(".popupoverlay").show();
        $(".reviewpopup_cont3").show();
        // reset values
        $("textarea.splittinymce", '.reviewpopup_cont3').val('');
        $('.isAgendaItemIndexed', '.reviewpopup_cont3').prop('checked', false);
        e.preventDefault();
    });
    // add new agenda yes button
    $(".approve3").click(function(e) {
        // vars
        var checked = $('.isAgendaItemIndexed', '.reviewpopup_cont3').is(':checked');
        var htmlData = $("textarea.splittinymce", '.reviewpopup_cont3').val();
        checked = (checked) ? 1 : 0;
        if (htmlData != '') {
            // ajax load
            jQuery.ajax({
                cache: false,
                type: 'post',
                url: 'EditSessionHandler.ashx',
                data: {
                    funcname: 'AddAgendaItem',
                    agendaitemtext: encodeURIComponent(htmlData),
                    sid: $(".sessionID").val(),
                    isindexed: checked,
                    c: $(".hdSessionContentItemID").val()
                },
                dataType: 'json',
                success: function(response) {
                    // save the id
                    $('.agendaItemId').val(response);
                    // close the popup
                    $(".popupoverlay").hide();
                    $(".reviewpopup_cont3").hide();
                    // repalce the button with the content
                    $(".addingNewAgendaItem").hide();
                    $('.agendaItemTxt').html(htmlData);
                    if (response != 0) {
                        $(".divAgenda").show();
                    }
                },
                error: function() {}
            });
        }
        e.preventDefault();
    });
});