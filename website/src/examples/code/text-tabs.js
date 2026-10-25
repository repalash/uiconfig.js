export default function example(ui) {
    // #region
    const note = {
        title: 'Release notes',
        body: 'Line one\nLine two\nLine three',
        draft: true,
        audience: 'everyone',
        channel: 'stable',
    }

    ui.appendChild({
        type: 'folder',
        label: 'Note',
        expanded: true,
        children: [
            {type: 'input', label: 'Title', property: [note, 'title']},
            {type: 'textarea', label: 'Body', rows: 4, property: [note, 'body']},
            {type: 'separator'},
            {
                type: 'tabs',
                children: [
                    {
                        type: 'folder',
                        label: 'Publish',
                        children: [
                            {type: 'checkbox', label: 'Draft', property: [note, 'draft']},
                            {
                                type: 'dropdown',
                                label: 'Channel',
                                property: [note, 'channel'],
                                children: [{label: 'stable'}, {label: 'beta'}],
                            },
                        ],
                    },
                    {
                        type: 'folder',
                        label: 'Audience',
                        children: [
                            {type: 'input', label: 'Audience', property: [note, 'audience']},
                        ],
                    },
                ],
            },
        ],
    })
    // #endregion
}
