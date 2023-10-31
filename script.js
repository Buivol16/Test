import { Client } from '@stomp/stompjs';

var urlPrefix = "live-chat-example.onrender.com";

var client;
var author = {
    "specialId": "",
    "name": ""
}
var chatID;

$(document).ready(function () {
    $("#connect").click(clickEvent);
});

function clickEvent() {
    if (!$("#status-block").length) {
        var but = $("#connect");
        var block = $("<div id=\"status-block\"></div>");
        but.after(block);
        clickButtonAnimation(but);
        addLog("Connection...");
        fadeOutBlockAnim(block);
        setTimeout(() => {
            block.removeAttr('style');
            connect(block);
        }, 350);

    }
}

function clickButtonAnimation(button) {
    button.animate({
        height: '0px',
        width: '0px',
        opacity: '0%',
        fontSize: '0'
    }, 200);
    setTimeout(() => button.remove(), 200);
}

function fadeOutBlockAnim(block) {
    block.css({
        height: '0vh'
    });
    block.animate({
        height: "50vh"
    }, 300);
}

function connect() {
    var url = `wss://${urlPrefix}/livechat`;
    client = new Client({
        brokerURL: url
    });
    client.onConnect = connectSuccessEvent;
    client.onWebSocketError = (error) => connectErrorEvent(error);
    client.onStompError = (error) => connectErrorEvent(error);
    client.activate();
}

function connectSuccessEvent() {
    clickButtonAnimation($("#status-block"));
    setTimeout(() => $("#status-block").remove(), 200);
    selectName();
}

function connectErrorEvent(error) {
    addLog('Something went wrong... Maybe server status is disabled or wrong adress. Check log for more information.');
    console.error(error);
}

function addLog(text) {
    var status = $("<p>" + text + "</p>");
    $('#status-block').append(status);
}

function selectName() {
    if (author.name === "") {
        var pTag = $("<p></p").text("Type your name");
        var inputTag = $("<input type=\"text\" id=\"input-name\" placeholder=\"Input your name\">");
        var buttonTag = $("<button id=\"enter-button\" type=\"submit\">Enter</button>");
        var main = $("#main");
        main.append(pTag).append(inputTag).append(buttonTag);
        buttonTag = $("#enter-button");
        buttonTag.click(() => {
            author.name = inputTag.val();
            animateToHide(main);
            setTimeout(() => {
                main.empty();
                main.removeAttr("style");
                main.promise().done(function () {
                    registerUser();
                });
            }, 230);

        });
    }
}

function getChat(chatId) {
    $.ajax({
        type: "GET",
        url: `https://${urlPrefix}/get-chat/${chatId}`,
        success: function (response) {
            mapChat(response);
        }
    });
}

function sendMessage(messageText) {
    var topColumn = $("div.top-column");
    var json = JSON.stringify({
        'author': {
            'specialId': author.specialId,
            'name': author.name
        },
        'chatId': chatID,
        'text': messageText,
        'publishedAt': new Date()
    })
    client.publish({
        destination: '/app/chat/' + chatID, body: json
    });
    topColumn.animate({ scrollTop: topColumn.prop("scrollHeight") }, 500);
}

function createChatFrame() {
    var main = $("#main");
    var frame = $("<main id=\"frame\"></main>");
    var head = $("<div id=\"head\"></div>");
    var nav = $("<nav></nav>");
    var openNav = $("<span class=\"material-symbols-outlined mobile\">arrow_forward_ios</span>")
    var addChatButton = $("<div id=\"add-chat\" class=\"material-symbols-outlined\">Add</div>");
    main.append(head);
    main.append(frame);
    if (window.matchMedia('(max-width: 768px)').matches) {
        main.append(nav);
        head.append(openNav);
        nav.append(addChatButton);
        addChatButton.click(addChatBlock);
        getChatList();
        openNav.click(() => {
            openNav.transition({
                opacity: '0%'
            }, 400, 'ease');
            nav.transition({
                left: '0%',
                boxShadow: '0 0 0 max(100vh, 100vw) rgba(0, 0, 0, .3)'
            }, 400, 'ease', function () {
                $(document).click(function (event) {
                    var $target = $(event.target);
                    if (!$target.closest(nav).length &&
                        nav.is(":visible")) {
                        openNav.transition({
                            opacity: '100%'
                        }, 200, 'ease');
                        nav.transition({
                            left: '-50%',
                            boxShadow: '0 0 0 max(100vh, 100vw) rgba(0, 0, 0, 0)'
                        }, 400, 'ease', function () {
                            $(document).unbind('click');

                        });
                    }
                })
            });
        });

        head.append("<p>" + author.name + " #" + author.specialId + "</p>");
    }
    else {
        frame.append(nav);
        head.append("<p>" + author.name + " #" + author.specialId + "</p>");
        nav.append(addChatButton);
        addChatButton.click(addChatBlock);
        main.css({
            height: '0',
            width: '0'
        });
        main.animate({
            height: '100%',
            width: '100%'
        }, 300);
        main.promise().done(function () {
            main.removeAttr('style');
            getChatList();
        });
    }
}

function createChat(chatName, block, area) {
    var json = JSON.stringify({
        'chatName': chatName,
        'clientDTO': author
    });
    $.ajax({
        type: "POST",
        url: `https://${urlPrefix}/create-chat`,
        data: json,
        contentType: "application/json",
        success: () => closeButtonEvent(block, area)
    });
}

function doAddPrivateChat(chatName, block, area) {
    var json = JSON.stringify({
        'chatName': chatName,
        'clientDTO': author
    });
    $.ajax({
        type: "POST",
        url: `https://${urlPrefix}/create-private-chat`,
        data: json,
        contentType: "application/json",
        success: () => closeButtonEvent(block, area)
    });
}



function addChatBlock() {
    var area = $("<div id=\"area\"></div>");
    var block = $("<div id=\"add-chat-block\"></div>");
    var p = $("<p>Type chat name</p>");
    var close = $("<div id=\"block-close\" class=\"material-symbols-outlined\">close</div>");
    var input = $("<input id=\"chat-name-field\" type=\"text\">");
    var submit = $("<input id=\"chat-name-submit\" type=\"submit\">");
    var addChatEvent = function () {
        if (input.val().startsWith("#")) doAddPrivateChat(input.val(), block, area);
        else createChat(input.val(), block, area);
    }
    $("body").append(area);
    area.append(block);
    block.transition({
        y: '9.2%'
    }, 0).transition({
        y: '25%',
        boxShadow: '0 0 0 max(100vh, 100vw) rgba(0, 0, 0, .3)'
    }, 200, 'ease');

    block.append(close).append(p).append(input).append(submit);
    close.click(() => {
        closeButtonEvent(block, area)
    });
    submit.click(addChatEvent);
}

function closeButtonEvent(blockClose, background) {
    blockClose.transition({
        y: '9.2%',
        boxShadow: '0 0 0 max(100vh, 100vw) rgba(0, 0, 0, 0)'
    }, 200, 'ease');
    blockClose.promise().done(() => {
        background.remove();
    });

}

function animateToHide(item) {
    item.animate({
        height: '0',
        width: '0'
    }, 200);
}

function registerUser() {
    $.ajax({
        type: "POST",
        url: `https://${urlPrefix}/create-client`,
        data: {
            name: author.name
        },
        success: function (response) {
            author.specialId = response.specialId;
            createChatFrame();
        },
        error: function (response) {
            console.error(response);
        }
    });
}

function getChatList() {
    $.ajax({
        type: "GET",
        url: `https://${urlPrefix}/get-list`,
        success: function (response) {
            $.each(response, function (i, item) {
                mapChatToList(item);
            });
        },
        error: function (response) {
            console.error(response);
        }
    });
    client.subscribe("/chats/list", (response) => {
        var body = JSON.parse(response.body);
        mapChatToList(body);
    });
    client.subscribe(`/chats/private/${author.specialId}`, (response) => {
        var body = JSON.parse(response.body);
        mapChatToList(body);
    });
}

function mapChatToList(chat) {
    var chatElem = $("<chat></chat>");
    var nav = $("nav");
    var chatName;
    try {
        if (author.specialId === chat.participant.specialId) chatName = `${chat.creator.name} #${chat.creator.specialId}`;
        else chatName = `${chat.participant.name} #${chat.participant.specialId}`;
    } catch (error) {
        chatName = chat.name;
    }
    chatElem.attr("chatid", chat.id);
    chatElem.text(chatName);
    client.subscribe(`/messages/${chat.id}`, (response) => {
        var body = JSON.parse(response.body);
        var topColumn = $("div.top-column");
        if (body.chatId === chatID) mapMessage(body, topColumn);
    });
    chatElem.click(() => {
        unselectChatEvent(chatElem);
        chatID = chat.id;
        getChat(chat.id);
    });
    if (!alreadyHasChat(chatElem, nav)) nav.append(chatElem);
}

function alreadyHasChat(chatElem, nav) {
    var answer = false;
    nav.children().each((i, elem) => {
        if (elem.getAttribute('chatId') === chatElem.attr('chatId')) answer = true;
    });
    return answer;
}

function unselectChatEvent(chatElem) {
    var selected = $("[selected]");
    selected.transition({
        borderRadius: "10px",
        background: "#00171f00"
    }, 300, 'ease');
    selected.promise().done(() => {
        selected.removeAttr("selected");
        selected.removeAttr("style");
        chatElem[0].setAttribute("selected", "");
    });
    chatElem.transition({
        borderRadius: "0px",
        background: "#00171f"
    }, 200, 'ease');
}

function mapChat(chatDTO) {
    var cur = $("#current");
    if (cur.attr("chatid") !== chatDTO.id) {
        var messageInput;
        var frame = $("#frame");
        var chatDiv = $(`<div chatid="${chatDTO.id}" id="current">`);
        var bottomColumn = $("<div class=\"bottom-column\"></div>");
        var topColumn = $("<div class=\"top-column\"></div>");
        var input = $("<div id=\"send-message\"><input type=\"text\" placeholder=\"Type your message...\" id=\"message-input\"><img src=\"/img/sendMessage.png\" id=\"send-message-img\" alt=\"Send message\"></div>");
        if (cur.length) cur.remove();
        frame.append(chatDiv);
        chatDiv.append(topColumn);
        chatDiv.append(bottomColumn);
        bottomColumn.append(input);
        messageInput = $("#message-input");
        messageInput.on('keypress', (e) => { checkBeforeSend(messageInput, e); });
        $("#send-message-img").click(() => {
            var val = messageInput.val().trim();
            if (val !== "") {
                sendMessage(val);
                messageInput.val("");
            }
        });
        LoadMessages(chatDTO, topColumn);
    }

}

function checkBeforeSend(messageInput, e) {
    var val = messageInput.val().trim();
    if (e.which == 13 && val !== "") {
        sendMessage(val);
        messageInput.val("");
    }
}

function LoadMessages(chatDTO, topColumn) {
    try {
        chatDTO.messageDTOs.forEach((data) => {
            mapMessage(data, topColumn);
        });
    } catch (error) {
        console.info("In this chat is no more messages.");
    }
}

function mapMessage(data, topColumn) {
    if (data.author.specialId === author.specialId) {
        var message = $(`<message>\n<author>${data.author.name} #${data.author.specialId}</author>\n<message-text>${data.text}</message-text>\n</message>`);
        topColumn.append(message);
    } else {
        var messageRep = $(`<message replied>\n<author>${data.author.name} #${data.author.specialId}</author>\n<message-text>${data.text}</message-text>\n</message>`);
        topColumn.append(messageRep);
    }
    if ((topColumn.scrollTop() - topColumn.prop("scrollHeight")) > -800) topColumn.scrollTop(topColumn.prop("scrollHeight"));
}