import React, { useState, useEffect } from 'react';
import './SplitItems.css';

const SplitItems = ({ receipt }) => {
    const [friends, setFriends] = useState(['']);
    const [splits, setSplits] = useState({});
    const [totals, setTotals] = useState({});

    useEffect(() => {
        calculateTotals();
    }, [splits]);

    const addFriend = () => {
        setFriends([...friends, '']);
    };

    const updateFriend = (index, name) => {
        const updatedFriends = [...friends];
        updatedFriends[index] = name;
        setFriends(updatedFriends);
    };

    const handleSplitChange = (itemIndex, friendIndex) => {
        setSplits(prevSplits => ({
            ...prevSplits,
            [itemIndex]: {
                ...prevSplits[itemIndex],
                [friendIndex]: !prevSplits[itemIndex]?.[friendIndex]
            }
        }));
    };

    const calculateTotals = () => {
        const newTotals = {};
        receipt.items.forEach((item, itemIndex) => {
            const itemSplits = splits[itemIndex];
            if (itemSplits) {
                const splitCount = Object.values(itemSplits).filter(Boolean).length;
                if (splitCount > 0) {
                    const splitAmount = item.totalPrice / splitCount;
                    Object.entries(itemSplits).forEach(([friendIndex, isSplit]) => {
                        if (isSplit) {
                            const friendName = friends[friendIndex] || `Friend ${parseInt(friendIndex) + 1}`;
                            newTotals[friendName] = (newTotals[friendName] || 0) + splitAmount;
                        }
                    });
                }
            }
        });
        setTotals(newTotals);
    };

    return (
        <div className="split-items">
            <h3>Split Items</h3>
            <div className="friends-list">
                {friends.map((friend, index) => (
                    <input
                        key={index}
                        type="text"
                        value={friend}
                        onChange={(e) => updateFriend(index, e.target.value)}
                        placeholder={`Friend ${index + 1}`}
                    />
                ))}
                <button onClick={addFriend}>Add Friend</button>
            </div>
            <table>
                <thead>
                <tr>
                    <th>Item</th>
                    <th>Price</th>
                    {friends.map((friend, index) => (
                        <th key={index}>{friend || `Friend ${index + 1}`}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {receipt.items.map((item, itemIndex) => (
                    <tr key={itemIndex}>
                        <td>{item.description}</td>
                        <td>${item.totalPrice.toFixed(2)}</td>
                        {friends.map((_, friendIndex) => (
                            <td key={friendIndex}>
                                <input
                                    type="checkbox"
                                    checked={splits[itemIndex]?.[friendIndex] || false}
                                    onChange={() => handleSplitChange(itemIndex, friendIndex)}
                                />
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
            <div className="totals">
                <h4>Totals</h4>
                <ul>
                    {Object.entries(totals).map(([name, total]) => (
                        <li key={name}>{name}: ${total.toFixed(2)}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SplitItems;
