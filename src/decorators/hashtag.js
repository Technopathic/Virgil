const Hashtag = (props) => {

    const tagStyle = {
        background:'#000000',
        borderRadius:'4px',
        color:'#FFFFFF',
        boxSizing:'border-box',
        padding:'3px 6px',
        fontSize:'16px'
    }

    return (
        <span style={tagStyle}>
            {props.children}
        </span>
    )
}

export default Hashtag